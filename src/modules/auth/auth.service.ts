import { BadRequestError, UnAuthenticatedError } from "../../errors";
import {
  AuthCodePurpose,
  PaymentMethod,
  RoleEnum,
} from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";
import { MailService } from "../../services/mail.service";
import { comparePassword, hashPassword } from "../../utils/password";
import {
  CustomerLoginBodyDto,
  CustomerLoginResponseDto,
  CustomerSignupBodyDto,
  CustomerSignupResponseDto,
  ResendVerificationCodeBodyDto,
  VerifyEmailBodyDto,
  VerifyEmailResponseDto,
  LogoutCustomerBodyDto,
  RefreshCustomerTokenBodyDto,
  RefreshCustomerTokenResponseDto,
} from "./auth.dto";
import { buildVerificationEmail } from "./auth.mail";
import { AuthRepo } from "./auth.repo";
import crypto from "crypto";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";

export class AuthService {
  constructor(
    private authRepo: AuthRepo,
    private mailService: MailService,
  ) {}

  // -------------------- CUSTOMER SIGNUP --------------------
  async customerSignup(
    dto: CustomerSignupBodyDto,
  ): Promise<CustomerSignupResponseDto> {
    const existingUser = await this.authRepo.findUserByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestError("Email is already registered");
    }

    const verificationCode = crypto.randomInt(100000, 1000000).toString();

    const [passwordHash, codeHash] = await Promise.all([
      hashPassword(dto.password),
      hashPassword(verificationCode),
    ]);

    // Code expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const user = await this.authRepo.createUser(
        dto.name,
        dto.email,
        passwordHash,
        tx,
      );

      const customer = await this.authRepo.createCustomer(
        user.id,
        dto.phone,
        dto.gender,
        tx,
      );

      await this.authRepo.createAuthCode(
        user.id,
        AuthCodePurpose.EMAIL_VERIFICATION,
        codeHash,
        expiresAt,
        tx,
      );
      return { user, customer };
    });

    const emailContent = buildVerificationEmail(dto.name, verificationCode);

    await this.mailService.sendMail({
      to: dto.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return {
      userId: result.user.id,
      customerId: result.customer.id,
      email: result.user.email,
      role: result.user.role,
    };
  }

  // -------------------- CUSTOMER VERIFY EMAIL --------------------
  async verifyEmail(dto: VerifyEmailBodyDto): Promise<VerifyEmailResponseDto> {
    const user = await this.authRepo.findUserByEmail(dto.email);

    this.assertCustomerUserCanVerifyEmail(user);

    const authCode = await this.authRepo.findLatestAuthCodeByUserIdAndPurpose(
      user!.id,
      AuthCodePurpose.EMAIL_VERIFICATION,
    );

    this.assertAuthCodeIsUsable(authCode);

    const isCodeValid = await comparePassword(dto.code, authCode!.codeHash);

    if (!isCodeValid) {
      throw new BadRequestError("Invalid verification code");
    }

    const verifiedUser = await prisma.$transaction(async (tx) => {
      const updatedUser = await this.authRepo.verifyUserEmail(user!.id, tx);

      await this.authRepo.consumeAuthCode(authCode!.id, tx);

      return updatedUser;
    });

    return {
      userId: verifiedUser.id,
      email: verifiedUser.email,
      emailVerifiedAt: verifiedUser.emailVerifiedAt!,
    };
  }

  // -------------------- CUSTOMER RESEND VERIFICATION CODE --------------------
  async resendVerificationCode(
    dto: ResendVerificationCodeBodyDto,
  ): Promise<void> {
    const user = await this.authRepo.findUserByEmail(dto.email);

    this.assertCustomerUserCanVerifyEmail(user);

    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    const codeHash = await hashPassword(verificationCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.authRepo.createAuthCode(
      user!.id,
      AuthCodePurpose.EMAIL_VERIFICATION,
      codeHash,
      expiresAt,
    );

    const emailContent = buildVerificationEmail(user!.name, verificationCode);

    await this.mailService.sendMail({
      to: user!.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  // -------------------- CUSTOMER LOGIN --------------------
  async customerLogin(
    dto: CustomerLoginBodyDto,
  ): Promise<CustomerLoginResponseDto> {
    const user = await this.authRepo.findCustomerLoginContextByEmail(dto.email);

    this.assertCustomerUserCanLogin(user);

    const isPasswordValid = await comparePassword(dto.password, user!.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid email or password");
    }

    // expires in 7 days
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    const result = await prisma.$transaction(async (tx) => {
      const refreshTokenRecord = await this.authRepo.createRefreshToken(
        user!.id,
        refreshTokenExpiresAt,
        tx,
      );

      const accessToken = signAccess({
        customerId: user!.customer!.id,
        role: RoleEnum.CUSTOMER,
      });

      const refreshToken = signRefresh({
        userId: user!.id,
        refreshTokenId: refreshTokenRecord.id,
      });

      const refreshTokenHash = this.hashRefreshToken(refreshToken);

      await this.authRepo.updateRefreshTokenHash(
        refreshTokenRecord.id,
        refreshTokenHash,
        tx,
      );

      return {
        accessToken,
        refreshToken,
      };
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        emailVerifiedAt: user!.emailVerifiedAt,
        isActive: user!.isActive,
      },
      customer: {
        id: user!.customer!.id,
        userId: user!.customer!.userId,
        phone: user!.customer!.phone,
        gender: user!.customer!.gender,
        paymentPreference: user!.customer!.paymentPreference,
      },
    };
  }

  // ------------------ CUSTOMER REFRESH TOKEN ------------------
  async refreshCustomerToken(
    dto: RefreshCustomerTokenBodyDto,
  ): Promise<RefreshCustomerTokenResponseDto> {
    const payload = this.verifyRefreshTokenOrThrow(dto.refreshToken);

    const currentRefreshToken =
      await this.authRepo.findRefreshTokenWithCustomerContext(
        payload.refreshTokenId,
      );

    this.assertCustomerRefreshTokenCanBeUsed(
      currentRefreshToken,
      payload.userId,
    );

    this.assertRefreshTokenMatches(
      dto.refreshToken,
      currentRefreshToken!.refreshTokenHash!,
    );

    const nextRefreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    return await prisma.$transaction(async (tx) => {
      await this.authRepo.revokeRefreshToken(currentRefreshToken!.id, tx);

      const nextRefreshTokenRecord = await this.authRepo.createRefreshToken(
        currentRefreshToken!.user.id,
        nextRefreshTokenExpiresAt,
        tx,
      );

      const accessToken = signAccess({
        customerId: currentRefreshToken!.user.customer!.id,
        role: RoleEnum.CUSTOMER,
      });

      const refreshToken = signRefresh({
        userId: currentRefreshToken!.user.id,
        refreshTokenId: nextRefreshTokenRecord.id,
      });

      const refreshTokenHash = this.hashRefreshToken(refreshToken);

      await this.authRepo.updateRefreshTokenHash(
        nextRefreshTokenRecord.id,
        refreshTokenHash,
        tx,
      );

      return {
        accessToken,
        refreshToken,
      };
    });
  }

  // ---------------- LOGOUT ----------------
  async logoutCustomer(dto: LogoutCustomerBodyDto): Promise<void> {
    const payload = this.verifyRefreshTokenOrThrow(dto.refreshToken);

    const currentRefreshToken =
      await this.authRepo.findRefreshTokenWithCustomerContext(
        payload.refreshTokenId,
      );

    this.assertCustomerRefreshTokenCanBeUsed(
      currentRefreshToken,
      payload.userId,
    );

    this.assertRefreshTokenMatches(
      dto.refreshToken,
      currentRefreshToken!.refreshTokenHash!,
    );

    await this.authRepo.revokeRefreshToken(currentRefreshToken!.id);
  }

  private assertCustomerUserCanVerifyEmail(
    user: {
      id: number;
      name: string;
      email: string;
      password: string;
      role: RoleEnum;
      isActive: number;
      emailVerifiedAt: Date | null;
    } | null,
  ) {
    if (!user) {
      throw new BadRequestError("Invalid verification request");
    }

    if (user.role !== RoleEnum.CUSTOMER) {
      throw new BadRequestError("This account is not a customer account");
    }

    if (user.isActive !== 1) {
      throw new BadRequestError("This account is inactive");
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestError("Email is already verified");
    }
  }

  private assertAuthCodeIsUsable(
    authCode: {
      id: number;
      codeHash: string;
      expiresAt: Date;
      consumedAt: Date | null;
      createdAt: Date;
    } | null,
  ) {
    if (!authCode) {
      throw new BadRequestError("Verification code not found");
    }

    if (authCode.consumedAt) {
      throw new BadRequestError("Verification code has already been used");
    }

    if (authCode.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError("Verification code has expired");
    }
  }
  private assertCustomerUserCanLogin(
    user: {
      id: number;
      name: string;
      email: string;
      password: string;
      role: RoleEnum;
      isActive: number;
      emailVerifiedAt: Date | null;
      customer: {
        id: number;
        userId: number;
        phone: string;
        gender: string | null;
        paymentPreference: PaymentMethod | null;
      } | null;
    } | null,
  ) {
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    if (user.role !== RoleEnum.CUSTOMER) {
      throw new BadRequestError("This account is not a customer account");
    }

    if (user.isActive !== 1) {
      throw new BadRequestError("This account is inactive");
    }

    if (!user.emailVerifiedAt) {
      throw new BadRequestError("Please verify your email before logging in");
    }

    if (!user.customer) {
      throw new BadRequestError("Customer profile not found");
    }
  }

  // ---------------- HELPER FOR REFRESH TOKEN ----------------
  private hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private verifyRefreshTokenOrThrow(refreshToken: string) {
    try {
      return verifyRefresh(refreshToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnAuthenticatedError("Refresh token has expired");
      }

      if (
        error instanceof JsonWebTokenError ||
        error instanceof NotBeforeError
      ) {
        throw new UnAuthenticatedError("Invalid refresh token");
      }

      throw error;
    }
  }

  private doesRefreshTokenMatch(
    presentedRefreshToken: string,
    storedRefreshTokenHash: string,
  ): boolean {
    const presentedRefreshTokenHash = this.hashRefreshToken(
      presentedRefreshToken,
    );

    const presentedBuffer = Buffer.from(presentedRefreshTokenHash);
    const storedBuffer = Buffer.from(storedRefreshTokenHash);

    if (presentedBuffer.length !== storedBuffer.length) {
      return false;
    }

    // we use timingSafeEqual to prevent timing attacks
    // timing attacks are a type of attack where an attacker can determine the length of a string by measuring the time it takes to process it
    return crypto.timingSafeEqual(presentedBuffer, storedBuffer);
  }

  private assertRefreshTokenMatches(
    presentedRefreshToken: string,
    storedRefreshTokenHash: string,
  ) {
    const isMatch = this.doesRefreshTokenMatch(
      presentedRefreshToken,
      storedRefreshTokenHash,
    );

    if (!isMatch) {
      throw new UnAuthenticatedError("Invalid refresh token");
    }
  }

  private assertCustomerRefreshTokenCanBeUsed(
    refreshTokenRecord: {
      id: number;
      userId: number;
      refreshTokenHash: string | null;
      expiresAt: Date;
      revokedAt: Date | null;
      user: {
        id: number;
        name: string;
        email: string;
        role: RoleEnum;
        isActive: number;
        emailVerifiedAt: Date | null;
        customer: {
          id: number;
          userId: number;
          phone: string;
          gender: string | null;
          paymentPreference: PaymentMethod | null;
        } | null;
      };
    } | null,
    expectedUserId: number,
  ) {
    if (!refreshTokenRecord) {
      throw new UnAuthenticatedError("Invalid refresh token");
    }

    if (refreshTokenRecord.userId !== expectedUserId) {
      throw new UnAuthenticatedError("Invalid refresh token");
    }

    if (!refreshTokenRecord.refreshTokenHash) {
      throw new UnAuthenticatedError("Invalid refresh token");
    }

    if (refreshTokenRecord.revokedAt) {
      throw new UnAuthenticatedError("Refresh token has been revoked");
    }

    if (refreshTokenRecord.expiresAt.getTime() < Date.now()) {
      throw new UnAuthenticatedError("Refresh token has expired");
    }

    if (refreshTokenRecord.user.role !== RoleEnum.CUSTOMER) {
      throw new UnAuthenticatedError("Invalid refresh token");
    }

    if (refreshTokenRecord.user.isActive !== 1) {
      throw new UnAuthenticatedError("This account is inactive");
    }

    if (!refreshTokenRecord.user.emailVerifiedAt) {
      throw new UnAuthenticatedError("Please verify your email first");
    }

    if (!refreshTokenRecord.user.customer) {
      throw new UnAuthenticatedError("Customer profile not found");
    }
  }
}

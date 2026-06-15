import { BadRequestError } from "../../errors";
import { AuthCodePurpose, RoleEnum } from "../../generated/prisma/enums";
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
} from "./auth.dto";
import { buildVerificationEmail } from "./auth.mail";
import { AuthRepo } from "./auth.repo";
import crypto from "crypto";
import { signAccess } from "../../utils/jwt";

export class AuthService {
  constructor(
    private authRepo: AuthRepo,
    private mailService: MailService,
  ) {}
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

  async customerLogin(
    dto: CustomerLoginBodyDto,
  ): Promise<CustomerLoginResponseDto> {
    const user = await this.authRepo.findUserByEmail(dto.email);

    this.assertCustomerUserCanLogin(user);

    const isPasswordValid = await comparePassword(dto.password, user!.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid email or password");
    }

    const customer = await this.authRepo.findCustomerByUserId(user!.id);

    if (!customer) {
      throw new BadRequestError("Customer profile not found");
    }

    const token = signAccess({
      userId: user!.id,
      customerId: customer.id,
      role: user!.role,
    });

    return {
      token,
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        emailVerifiedAt: user!.emailVerifiedAt,
        isActive: user!.isActive,
      },
      customer: {
        id: customer.id,
        userId: customer.userId,
        phone: customer.phone,
        gender: customer.gender,
        paymentPreference: customer.paymentPreference,
      },
    };
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
  }
}

import { BadRequestError } from "../../errors";
import { AuthCodePurpose } from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";
import { hashPassword } from "../../utils/password";
import { CustomerSignupBodyDto, CustomerSignupResponseDto } from "./auth.dto";
import { AuthRepo } from "./auth.repo";
import crypto from "crypto";

export class AuthService {
  constructor(private authRepo: AuthRepo) {}
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

    return {
      userId: result.user.id,
      customerId: result.customer.id,
      email: result.user.email,
      role: result.user.role,
      verificationCode:
        process.env.NODE_ENV === "production" ? undefined : verificationCode,
    };
  }
}

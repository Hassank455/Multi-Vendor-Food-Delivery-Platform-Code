import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import {
  CustomerLoginBodyDto,
  CustomerSignupBodyDto,
  ResendVerificationCodeBodyDto,
  VerifyEmailBodyDto,
} from "./auth.dto";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  customerSignup = asyncHandler(async (req: Request, res: Response) => {
    const dto: CustomerSignupBodyDto = req.body;
    const data = await this.authService.customerSignup(dto);

    res.status(StatusCodes.CREATED).json({
      message:
        "Customer account created successfully. Please check your email for the verification code.",
      data,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const dto: VerifyEmailBodyDto = req.body;
    const data = await this.authService.verifyEmail(dto);

    res.status(StatusCodes.OK).json({
      message: "Email verified successfully",
      data,
    });
  });

  resendVerificationCode = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResendVerificationCodeBodyDto = req.body;

    await this.authService.resendVerificationCode(dto);

    res.status(StatusCodes.OK).json({
      message: "Verification code resent successfully",
    });
  });

  customerLogin = asyncHandler(async (req: Request, res: Response) => {
    const dto: CustomerLoginBodyDto = req.body;
    const data = await this.authService.customerLogin(dto);

    res.status(StatusCodes.OK).json({
      message: "Customer logged in successfully",
      data,
    });
  });
}

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import { CustomerSignupBodyDto } from "./auth.dto";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  customerSignup = asyncHandler(async (req: Request, res: Response) => {
    const dto: CustomerSignupBodyDto = req.body;
    const data = await this.authService.customerSignup(dto);

    res.status(StatusCodes.CREATED).json({
      message: "Customer account created successfully",
      data,
    });
  });
}

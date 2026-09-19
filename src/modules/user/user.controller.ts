import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import { UserService } from "./user.services";
import { CreateManagedUserBodyDto } from "./user.model";

export class UserController {
  constructor(private userService: UserService) {}

  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateManagedUserBodyDto = req.body;
    const data = await this.userService.createAdmin(dto);

    res.status(StatusCodes.CREATED).json({
      message: "Admin account created successfully",
      data,
    });
  });

  createRestaurantOwner = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateManagedUserBodyDto = req.body;
    const data = await this.userService.createRestaurantOwner(dto);

    res.status(StatusCodes.CREATED).json({
      message: "Restaurant owner account created successfully",
      data,
    });
  });
}

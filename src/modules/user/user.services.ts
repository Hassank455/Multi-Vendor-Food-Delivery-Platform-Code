import { BadRequestError } from "../../errors";
import { RoleEnum } from "../../generated/prisma/enums";
import { hashPassword } from "../../utils/password";
import { CreateManagedUserBodyDto, ManagedUserResponseDto } from "./user.model";
import { UserRepository } from "./user.repository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createAdmin(
    dto: CreateManagedUserBodyDto,
  ): Promise<ManagedUserResponseDto> {
    return await this.createManagedUser(dto, RoleEnum.ADMIN);
  }

  async createRestaurantOwner(
    dto: CreateManagedUserBodyDto,
  ): Promise<ManagedUserResponseDto> {
    return await this.createManagedUser(dto, RoleEnum.RESTAURANT_OWNER);
  }

  private async createManagedUser(
    dto: CreateManagedUserBodyDto,
    role: typeof RoleEnum.ADMIN | typeof RoleEnum.RESTAURANT_OWNER,
  ): Promise<ManagedUserResponseDto> {
    const existingUser = await this.userRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestError("Email is already registered");
    }

    const passwordHash = await hashPassword(dto.password);

    return await this.userRepository.createManagedUser(
      dto.name,
      dto.email,
      passwordHash,
      role,
    );
  }
}

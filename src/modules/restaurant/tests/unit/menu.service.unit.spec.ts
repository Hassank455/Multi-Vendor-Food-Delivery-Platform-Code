/// <reference types="jest" />
import { MenuService } from "../../services/menu.service";
import { NotFoundError } from "../../../../errors";
import { MenuRepository } from "../../repos/menu.repo";

type MenuRepositoryMock = {
  [K in
    | "findRestaurantByOwnerId"
    | "findCategoryByRestaurantId"
    | "createMenuItem"
    | "updateMenuItem"
    | "findMenuItemByRestaurantId"]: jest.MockedFunction<MenuRepository[K]>;
};

const ownerId = 10;
const restaurantId = 20;

const mockCategory = {
  id: 1,
  name: "Pizza",
  restaurantId,
};

const mockRestaurant = {
  id: restaurantId,
  ownerId,
  name: "Restaurant 1",
  description: "Description 1",
  address: "Address 1",
  latitude: 1,
};

const mockMenuItem = {
  id: 100,
  name: "Margherita",
  description: "Classic pizza",
  price: 25,
  isAvailable: true,
  restaurantId,
  category: {
    id: mockCategory.id,
    name: mockCategory.name,
  },
};

const mockCreateMenuItemDto = {
  name: "Margherita",
  description: "Classic pizza",
  price: 25,
  categoryId: 1,
};

// describe -> using for grouping tests that are related to each other
describe("MenuService.createMenuItem", () => {
  let menuRepository: MenuRepositoryMock;
  let service: MenuService;

  // beforeEach -> run before each test
  beforeEach(() => {
    menuRepository = {
      findRestaurantByOwnerId: jest.fn(),
      findCategoryByRestaurantId: jest.fn(),
      createMenuItem: jest.fn(),
      updateMenuItem: jest.fn(),
      findMenuItemByRestaurantId: jest.fn(),
    };

    service = new MenuService(menuRepository as unknown as MenuRepository);
  });

  it("throws NotFoundError when the owner restaurant does not exist", async () => {
    // Arrange -> set up the test
    // Act -> call the function
    // Assert -> check the result

    // Arrange
    // this line mean that when findRestaurantByOwnerId is called it will return null
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(null);

    // Act + Assert
    await expect(
      service.createMenuItem(ownerId, restaurantId, mockCreateMenuItemDto),
    ).rejects.toThrow(new NotFoundError("Restaurant not found"));
    // same as above
    // await expect(service.createMenuItem(10, 20, dto)).rejects.toThrow(
    //   "Restaurant not found",
    // );

    // this line meaning that when findRestaurantByOwnerId is called it will return null
    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(10, 20);
    // this line meaning that when findCategoryByRestaurantId is not called
    // إذا المطعم غير موجود، فلا يجب أن يكمل إلى فحص category.
    expect(menuRepository.findCategoryByRestaurantId).not.toHaveBeenCalled();
    expect(menuRepository.createMenuItem).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the menu category does not exist", async () => {
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(mockRestaurant);

    menuRepository.findCategoryByRestaurantId.mockResolvedValue(null);

    await expect(
      service.createMenuItem(ownerId, restaurantId, mockCreateMenuItemDto),
    ).rejects.toThrow(new NotFoundError("Menu category not found"));
    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(
      ownerId,
      restaurantId,
    );
    expect(menuRepository.findCategoryByRestaurantId).toHaveBeenCalledWith(
      restaurantId,
      mockCreateMenuItemDto.categoryId,
    );
    expect(menuRepository.createMenuItem).not.toHaveBeenCalled();
  });

  it("creates a menu item when the owner restaurant and category exist", async () => {
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(mockRestaurant);
    menuRepository.findCategoryByRestaurantId.mockResolvedValue(mockCategory);
    menuRepository.createMenuItem.mockResolvedValue(mockMenuItem);

    const result = await service.createMenuItem(
      ownerId,
      restaurantId,
      mockCreateMenuItemDto,
    );

    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(
      ownerId,
      restaurantId,
    );
    expect(menuRepository.findCategoryByRestaurantId).toHaveBeenCalledWith(
      restaurantId,
      mockCreateMenuItemDto.categoryId,
    );
    expect(menuRepository.createMenuItem).toHaveBeenCalledWith(
      restaurantId,
      mockCreateMenuItemDto,
    );
    expect(result).toEqual(mockMenuItem);
  });
});

describe("MenuService.updateMenuItem", () => {
  let menuRepository: MenuRepositoryMock;
  let service: MenuService;
  beforeEach(() => {
    menuRepository = {
      findRestaurantByOwnerId: jest.fn(),
      findCategoryByRestaurantId: jest.fn(),
      createMenuItem: jest.fn(),
      updateMenuItem: jest.fn(),
      findMenuItemByRestaurantId: jest.fn(),
    };

    service = new MenuService(menuRepository as unknown as MenuRepository);
  });

  it("throws NotFoundError when the owner restaurant does not exist", async () => {
    // Arrange
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(null);

    // Act
    const action = service.updateMenuItem(
      ownerId,
      restaurantId,
      mockMenuItem.id,
      mockCreateMenuItemDto,
    );

    // Assert
    await expect(action).rejects.toThrow("Restaurant not found");

    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(
      ownerId,
      restaurantId,
    );
    expect(menuRepository.updateMenuItem).not.toHaveBeenCalled();
  });
  it("throws NotFoundError when the menu item does not exist", async () => {
    // Arrange
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(mockRestaurant);
    menuRepository.findMenuItemByRestaurantId.mockResolvedValue(null);

    // Act
    const action = service.updateMenuItem(
      ownerId,
      restaurantId,
      mockMenuItem.id,
      mockCreateMenuItemDto,
    );

    // Assert
    await expect(action).rejects.toThrow("Menu item not found");

    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(
      ownerId,
      restaurantId,
    );
    expect(menuRepository.findMenuItemByRestaurantId).toHaveBeenCalledWith(
      restaurantId,
      mockMenuItem.id,
    );
    expect(menuRepository.findCategoryByRestaurantId).not.toHaveBeenCalled();
    expect(menuRepository.updateMenuItem).not.toHaveBeenCalled();
  });
  it("throws NotFoundError when the new category does not exist", async () => {
    // Arrange
    menuRepository.findRestaurantByOwnerId.mockResolvedValue(mockRestaurant);
    menuRepository.findMenuItemByRestaurantId.mockResolvedValue({
      id: mockMenuItem.id,
      name: mockMenuItem.name,
      restaurantId: mockMenuItem.restaurantId,
      categoryId: mockMenuItem.category.id,
    });
    menuRepository.findCategoryByRestaurantId.mockResolvedValue(null);

    // Act
    const action = service.updateMenuItem(
      ownerId,
      restaurantId,
      mockMenuItem.id,
      mockCreateMenuItemDto,
    );

    // Assert
    await expect(action).rejects.toThrow("Menu category not found");

    expect(menuRepository.findRestaurantByOwnerId).toHaveBeenCalledWith(
      ownerId,
      restaurantId,
    );
    expect(menuRepository.findMenuItemByRestaurantId).toHaveBeenCalledWith(
      restaurantId,
      mockMenuItem.id,
    );
    expect(menuRepository.findCategoryByRestaurantId).toHaveBeenCalledWith(
      restaurantId,
      mockCreateMenuItemDto.categoryId,
    );
    expect(menuRepository.updateMenuItem).not.toHaveBeenCalled();
  });
  it("updates the menu item when categoryId is not provided", async () => {});
  it("updates the menu item when a valid categoryId is provided", async () => {});
  it("does not validate category when categoryId is undefined", async () => {});
});

import { OwnerController } from "./owner/owner.controller";
import { OwnerRepository } from "./owner/owner.repository";
import { OwnerService } from "./owner/owner.service";
import { MenuController } from "./menu/menu.controller";
import { MenuRepository } from "./menu/menu.repository";
import { MenuService } from "./menu/menu.service";
import { CatalogController } from "./catalog/catalog.controller";
import { CatalogRepository } from "./catalog/catalog.repository";
import { CatalogService } from "./catalog/catalog.service";

const ownerRepository = new OwnerRepository();
const ownerService = new OwnerService(ownerRepository);
const ownerController = new OwnerController(ownerService);

const menuRepository = new MenuRepository();
const menuService = new MenuService(menuRepository);
const menuController = new MenuController(menuService);

const catalogRepository = new CatalogRepository();
const catalogService = new CatalogService(catalogRepository);
const catalogController = new CatalogController(catalogService);

export const restaurantModule = {
  ownerController,
  menuController,
  catalogController,
};

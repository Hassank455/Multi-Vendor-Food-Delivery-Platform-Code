import { OwnerController } from "./controllers/owner.controller";
import { OwnerRepository } from "./repos/owner.repo";
import { OwnerService } from "./services/owner.service";
import { MenuController } from "./controllers/menu.controller";
import { MenuRepository } from "./repos/menu.repo";
import { MenuService } from "./services/menu.service";
import { CatalogController } from "./controllers/catalog.controller";
import { CatalogRepository } from "./repos/catalog.repo";
import { CatalogService } from "./services/catalog.service";

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

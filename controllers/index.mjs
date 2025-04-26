import ComponentController from "@Piglet/controllers/component.controller";
import FileController from "@Piglet/controllers/file.controller";
import PageController from "@Piglet/controllers/page.controller";
import CoreController from "@Piglet/controllers/core.controller";
import ModuleController from "@Piglet/controllers/module.controller";
import { routeNames } from "@Piglet/libs/helpers";
import ApiController from "@Piglet/controllers/api.controller";

const { component, page, file, piglet, module, api } = routeNames;

export default {
  [component]: ComponentController,
  [file]: FileController,
  [page]: PageController,
  [piglet]: CoreController,
  [module]: ModuleController,
  [api]: ApiController,
};

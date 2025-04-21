import ComponentController from "@Piglet/controllers/component.controller.mjs";
import FileController from "@Piglet/controllers/file.controller.mjs";
import PageController from "@Piglet/controllers/page.controller.mjs";
import CoreController from "@Piglet/controllers/core.controller.mjs";
import ModuleController from "@Piglet/controllers/module.controller.mjs";
import { routeNames } from "@Piglet/libs/helpers.mjs";
import ApiController from "@Piglet/controllers/api.controller.mjs";

const { component, page, file, piglet, module, api } = routeNames;

export default {
  [component]: ComponentController,
  [file]: FileController,
  [page]: PageController,
  [piglet]: CoreController,
  [module]: ModuleController,
  [api]: ApiController,
};

import ComponentController from "@/core/controllers/component.controller.mjs";
import FileController from "@/core/controllers/file.controller.mjs";
import PageController from "@/core/controllers/page.controller.mjs";
import CoreController from "@/core/controllers/core.controller.mjs";
import ModuleController from "@/core/controllers/module.controller.mjs";
import { routeNames } from "@/core/libs/helpers.mjs";

const { component, page, file, core, module } = routeNames;

export default {
  [component]: ComponentController,
  [file]: FileController,
  [page]: PageController,
  [core]: CoreController,
  [module]: ModuleController,
};

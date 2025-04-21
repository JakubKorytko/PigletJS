import { resolvePath } from "@Piglet/utils/paths.mjs";
import CONST from "@Piglet/CONST.mjs";
import fs from "fs";
import { processAllComponents } from "@Piglet/libs/componentBuilder.mjs";
import { watchDirectory } from "@Piglet/watcher/methods.mjs";
import { routes } from "@Piglet/libs/routes.mjs";

const routeNames = CONST.routes.reduce((acc, route) => {
  acc[route] = Symbol(route);
  return acc;
}, {});

const getRouteFromRequest = (req) => {
  const urlStartWithApi = req.url.startsWith(CONST.customRouteAliases.api);
  const urlStartWithComponent = req.url.startsWith(
    CONST.customRouteAliases.component,
  );
  const urlStartWithModule = req.url.startsWith(
    CONST.customRouteAliases.module,
  );

  const urlStartWithPiglet = req.url.startsWith(
    CONST.customRouteAliases.piglet,
  );
  if (urlStartWithApi) return routeNames.api;
  if (urlStartWithModule) return routeNames.module;
  if (urlStartWithComponent) return routeNames.component;
  if (urlStartWithPiglet) return routeNames.piglet;
  if (fs.existsSync(routes[req.url])) return routeNames.page;
  return routeNames.file;
};

async function runWatcher() {
  if ([...process.argv].includes("--restart")) {
    console.msg("server.restarted");
  } else {
    console.msg("server.running", CONST.PORT);
    console.msg("server.pressReload");
    console.msg("server.pressRestart");
  }

  try {
    await processAllComponents();
    watchDirectory();
  } catch (err) {
    console.msg("server.initError", err);
  }
}

const proxyHandler = {
  customRoutes: {},

  set(target, prop, value, receiver) {
    if (Object.values(routeNames).includes(prop)) {
      const newValue = { ...this.customRoutes, [prop]: value };
      this.customRoutes = newValue;
      return Reflect.set(target, "customRoutes", newValue, receiver);
    } else {
      return Reflect.set(...arguments);
    }
  },

  get(target, prop, receiver) {
    if (prop === "listen") {
      return (...args) => {
        runWatcher()
          .then(() => {
            target.listen(...args);
          })
          .catch((err) => {
            console.error("Error in runWatcher:", err);
          });
      };
    }
    if (Object.values(routeNames).includes(prop)) {
      return this.customRoutes[prop];
    } else {
      return Reflect.get(...arguments);
    }
  },
};

const serverHandler = async (req, res) => {
  return req.socket.server.customRoutes[getRouteFromRequest(req)](req, res);
};

export {
  routeNames,
  proxyHandler,
  getRouteFromRequest,
  serverHandler,
  runWatcher,
};

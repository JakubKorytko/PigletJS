import { resolvePath } from "@/core/utils/paths.mjs";
import CONST from "@/core/CONST.mjs";
import fs from "fs";
import { processAllComponents } from "@/core/libs/componentBuilder.mjs";
import { watchDirectory } from "@/core/watcher/methods.mjs";

const routeNames = CONST.routes.reduce((acc, route) => {
  acc[route] = Symbol(route);
  return acc;
}, {});

const getRouteFromRequest = (req) => {
  const pagePath = resolvePath(
    `@/pages/${req.url.replace("/", "") || "home"}.html`,
  );
  const urlStartWithComponent = req.url.startsWith(
    CONST.customRouteAliases.component,
  );

  const urlStartWithCore = req.url.startsWith(CONST.customRouteAliases.core);

  if (urlStartWithComponent) return routeNames.component;
  if (urlStartWithCore) return routeNames.core;
  if (fs.existsSync(pagePath)) return routeNames.page;
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

const serverHandler = async (req, res) =>
  req.socket.server.customRoutes[getRouteFromRequest(req)](req, res);

export {
  routeNames,
  proxyHandler,
  getRouteFromRequest,
  serverHandler,
  runWatcher,
};

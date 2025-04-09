import { resolvePath } from "@/utils/paths.mjs";
import CONST from "@/src/CONST.mjs";
import fs from "fs";

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

  if (urlStartWithComponent) return routeNames.component;
  if (fs.existsSync(pagePath)) return routeNames.page;
  return routeNames.file;
};

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
    if (Object.values(routeNames).includes(prop)) {
      return this.customRoutes[prop];
    } else {
      return Reflect.get(...arguments);
    }
  },
};

const serverHandler = async (req, res) =>
  req.socket.server.customRoutes[getRouteFromRequest(req)](req, res);

export { routeNames, proxyHandler, getRouteFromRequest, serverHandler };

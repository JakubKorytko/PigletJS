// noinspection JSIgnoredPromiseFromCall

import setupPiglet from "./builder/build.mjs";

const args = process.argv.slice(2);

setupPiglet(import.meta.dirname, args.includes("--production"));

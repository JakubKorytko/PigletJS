import setupPiglet from "./builder/index.mjs";
const args = process.argv.slice(2);

setupPiglet(import.meta.dirname, args.includes("--dev"));

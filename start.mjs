// noinspection JSFileReferences
// @ts-ignore
import createApp from "./PigletJS/builder/index.mjs";

const args = process.argv.slice(2);

createApp(
  import.meta.dirname,
  args.includes("--create"),
  args.includes("--add-host"),
  args.includes("--production"),
);

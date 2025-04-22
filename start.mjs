// noinspection JSFileReferences
import createApp from "./PigletJS/libs/create.mjs";

const args = process.argv.slice(2);

createApp(
  import.meta.dirname,
  args.includes("--create"),
  args.includes("--add-host"),
  args.includes("--clear-templates"),
);

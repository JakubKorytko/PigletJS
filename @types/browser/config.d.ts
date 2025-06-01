export interface Config {
  allowDebugging: boolean;
  enableCoreLogs: {
    info: boolean;
    warn: boolean;
    error: boolean;
  };
}

declare global {
  interface Window {
    console: Console & {
      pig: (
        message: string,
        severity?: "info" | "warn" | "error",
        ...args: unknown[]
      ) => void;
      msg: (message: string, ...args: unknown[]) => void;
      printPigAscii: () => Promise<void>;
    };
  }
}

export const config: Config;

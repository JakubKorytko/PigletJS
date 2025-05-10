import { Navigate, FetchWithCache } from "./helpers";
import ReactiveComponent from "./classes/ReactiveComponent";

export interface Config {
  allowDebugging: boolean;
  enableCoreLogs: {
    info: boolean;
    warn: boolean;
    error: boolean;
  };
  componentCounter: number;
  state: Record<string, StateInterface<unknown>> | {};
  tree: Record<string, TreeNode<ReactiveComponent | Element>> | {};
  extension: {
    sendInitialData?: () => void;
    sendTreeUpdate?: () => void;
    sendStateUpdate?: () => void;
  };
  mountedComponents: Set<{
    tag: string;
    ref: HTMLElement | ReactiveComponent;
  }>;
  componentsCount: Record<string, number>;
  AppRoot: ReactiveComponent | undefined;
  log: (
    message: string,
    severity?: "info" | "warn" | "error",
    ...args: unknown[]
  ) => void;
  reset: () => void;
}

declare global {
  interface Window {
    Piglet: Config;
    $navigate: Navigate;
    fetchWithCache: FetchWithCache;
    __fetchCache: Map<string, string>;
    __fetchQueue: Map<string, Promise<string>>;
  }
}

export const config: Config;

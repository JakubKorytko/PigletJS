import { Navigate, FetchWithCache } from "./helpers";
import ReactiveComponent from "./classes/ReactiveComponent";
import ReactiveDummyComponent from "./classes/ReactiveDummyComponent";
import AppRoot from "./classes/AppRoot";
import { StateValue } from "./hooks.js";

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
  constructedComponents: Record<string, ReactiveComponent>;
  registeredComponents: Record<string, ReactiveComponent>;
  previousFetchComponentCacheKeys: Record<
    string,
    Record<"html" | "script" | "layout", string>
  >;
  AppRoot: AppRoot | undefined;
  log: (
    message: string,
    severity?: "info" | "warn" | "error",
    ...args: unknown[]
  ) => void;
  reset: () => void;
  __proxyCache: Map<string, StateValue<unknown>>;
  __fetchCache: Map<string, string>;
  __fetchQueue: Map<string, Promise<string>>;
  types: {
    RC: ReactiveComponent;
    RDC: ReactiveDummyComponent;
  };
}

declare global {
  interface Window {
    Piglet: Config;
    $navigate: Navigate;
    fetchWithCache: FetchWithCache;
  }
}

export const config: Config;

/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __COMMIT_SHA__: string;

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_COMMIT_SHA?: string;
  readonly VITE_REPOSITORY_URL?: string;
  readonly VITE_PAYPAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

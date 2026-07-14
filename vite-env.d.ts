/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

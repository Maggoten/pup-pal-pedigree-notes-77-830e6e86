
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_BUCKET_NAME: string | undefined;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly PUBLIC_SITE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type AppProfile = {
  id: string;
  display_name: string | null;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'suspended';
};

declare namespace App {
  interface Locals {
    user: import('@supabase/supabase-js').User | null;
    profile: AppProfile | null;
    isAdmin: boolean;
    isApproved: boolean;
  }
}

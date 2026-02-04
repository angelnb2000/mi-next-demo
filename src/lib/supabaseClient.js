import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

/**
 * Cliente Supabase para componentes del lado del navegador (Client Components).
 * Usa createBrowserClient que maneja automáticamente las cookies del navegador.
 *
 * IMPORTANTE: Solo usar en componentes con "use client"
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
);

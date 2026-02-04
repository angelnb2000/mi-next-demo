import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * Cliente Supabase para Server Components y Server Actions.
 * Maneja las cookies de sesión de forma segura (httpOnly).
 *
 * IMPORTANTE: Solo usar en Server Components o Server Actions.
 * Las cookies se manejan automáticamente con httpOnly = true para mayor seguridad.
 *
 * NOTA: En Next.js 15+, cookies() es async y debe ser awaited.
 * Por eso esta función es async y debe ser llamada con await.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignorar errores en middleware donde no se pueden escribir cookies
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // Ignorar errores en middleware donde no se pueden escribir cookies
          }
        },
      },
    },
  );
}

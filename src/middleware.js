import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware de Next.js para proteger rutas.
 * Se ejecuta ANTES de que se renderice cualquier página que coincida con el matcher.
 *
 * Función:
 * 1. Crea un cliente Supabase para middleware usando createServerClient
 * 2. Configura los métodos de cookies para request/response del middleware
 * 3. Verifica si hay un usuario autenticado
 * 4. Si no hay usuario y está intentando acceder a /dashboard, redirige a /login
 * 5. Actualiza las cookies de sesión automáticamente
 *
 * NOTA: En middleware de Next.js, usamos createServerClient con handlers especiales
 * para request/response porque el middleware tiene un contexto diferente.
 */
export async function middleware(req) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no está logueado y trata de acceder a /dashboard → redirigir a login
  if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

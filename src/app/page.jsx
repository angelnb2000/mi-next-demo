import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

/**
 * Página Principal (Root Page) - Server Component
 * 
 * Esta página actúa como un "router" inteligente:
 * - Si el usuario está autenticado → lo redirige a /dashboard
 * - Si NO está autenticado → lo redirige a /login
 * 
 * De esta forma, la página principal siempre lleva al usuario al lugar correcto.
 * No necesita UI porque siempre redirige automáticamente.
 */
export default async function HomePage() {
  const supabase = await supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Usuario autenticado → ir al dashboard
    redirect("/dashboard");
  } else {
    // Usuario NO autenticado → ir al login
    redirect("/login");
  }
}
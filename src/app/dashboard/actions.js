"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action: Crear una nueva tarea
 *
 * Las Server Actions son funciones que se ejecutan en el servidor.
 * Pueden ser llamadas directamente desde formularios o desde Client Components.
 *
 * Funcionamiento:
 * 1. Extrae el texto de la tarea del FormData
 * 2. Obtiene el usuario autenticado desde las cookies
 * 3. Inserta la tarea en Supabase con el user_id del usuario actual
 * 4. RLS (Row Level Security) asegura que solo se pueda insertar con el user_id correcto
 * 5. Revalida la página para mostrar la nueva tarea sin recargar
 */
export async function crearTarea(formData) {
  const texto = formData.get("texto");
  

  if (!texto || texto.trim() === "") {
    return { error: "El texto de la tarea es requerido" };
  }

  const supabase = await supabaseServer();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Insertar tarea con user_id
  const { error } = await supabase.from("tareas").insert({
    texto: texto.trim(),
    user_id: user.id,
  });

  if (error) {
    console.error("Error creando tarea:", error);
    return { error: error.message };
  }

  // Revalidar la página para mostrar la nueva tarea
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action: Eliminar una tarea
 *
 * Funcionamiento:
 * 1. Verifica que hay un usuario autenticado
 * 2. Elimina la tarea por ID
 * 3. RLS asegura que solo se puedan eliminar las tareas propias del usuario
 * 4. Revalida la página para actualizar la lista
 */
export async function eliminarTarea(id) {
  const supabase = await supabaseServer();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Eliminar tarea (RLS verifica que sea del usuario)
  const { error } = await supabase.from("tareas").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando tarea:", error);
    return { error: error.message };
  }

  // Revalidar la página
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action: Cerrar sesión
 *
 * Funcionamiento:
 * 1. Llama a supabase.auth.signOut() que elimina las cookies de sesión
 * 2. Redirige al usuario a la página de login
 * 3. Las cookies httpOnly se eliminan automáticamente
 */
export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

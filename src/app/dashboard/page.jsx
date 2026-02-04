import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { crearTarea, eliminarTarea, logout } from "./actions";

/**
 * Página Dashboard (Server Component)
 * 
 * Este es un Server Component que se renderiza en el servidor.
 * NO tiene "use client" porque todo el código se ejecuta en el servidor.
 * 
 * Ventajas de Server Components:
 * 1. Puede acceder a bases de datos directamente
 * 2. No envía JavaScript al navegador (más rápido)
 * 3. Protege credenciales y lógica sensible
 * 4. Las cookies se leen de forma segura en el servidor
 * 
 * Funcionamiento:
 * 1. Verifica si hay un usuario autenticado (si no, redirige a /login)
 * 2. Carga todas las tareas del usuario desde Supabase
 * 3. RLS en Supabase filtra automáticamente solo las tareas del usuario
 * 4. Renderiza la UI con las tareas y formularios
 * 5. Los formularios usan Server Actions para el CRUD
 */
export default async function DashboardPage() {
  const supabase = await supabaseServer();

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cargar tareas del usuario (RLS filtra automáticamente)
  const { data: tareas } = await supabase
    .from("tareas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, <span className="font-semibold text-purple-600">{user.email}</span>
              </p>
            </div>
            
            {/* Botón de logout usando Server Action */}
            <form action={logout}>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>

        {/* Card de crear tarea */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Nueva Tarea</h2>
          
          {/* Formulario usando Server Action */}
          <form action={crearTarea} className="flex gap-3">
            <input
              type="text"
              name="texto"
              placeholder="Escribe tu tarea aquí..."
              required
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              Agregar
            </button>
          </form>
        </div>

        {/* Lista de tareas */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            📝 Mis Tareas {tareas && tareas.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({tareas.length})
              </span>
            )}
          </h2>

          {!tareas || tareas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No tienes tareas aún</p>
              <p className="text-gray-300 text-sm mt-2">¡Crea tu primera tarea arriba! 👆</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tareas.map((tarea) => (
                <li
                  key={tarea.id}
                  className="flex items-center justify-between p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 hover:shadow-md transition-all group"
                >
                  <span className="text-gray-800 flex-1">{tarea.texto}</span>
                  
                  {/* Formulario para eliminar usando Server Action */}
                  <form action={eliminarTarea.bind(null, tarea.id)}>
                    <button
                      type="submit"
                      className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar tarea"
                    >
                      🗑️
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            🔒 Tus tareas están protegidas con RLS (Row Level Security)
          </p>
        </div>
      </div>
    </div>
  );
}

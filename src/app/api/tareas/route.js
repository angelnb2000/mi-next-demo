import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verificarJWT } from "@/lib/jwt"; // tu función de verificación

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const payload = token ? await verificarJWT(token) : null;
  if (!payload) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const tareas = await prisma.tarea.findMany({
    where: { user_id: String(payload.userId) },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(tareas);
}

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const payload = token ? await verificarJWT(token) : null;
  if (!payload) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const body = await req.json();

  const nueva = await prisma.tarea.create({
    data: {
      texto: body.texto,
      hecha: false,
      user_id: String(payload.userId),
    },
  });

  return NextResponse.json(nueva);
}
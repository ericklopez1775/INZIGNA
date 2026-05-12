import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, phone, token } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
  }

  let role = "CLIENT";

  // Validate invitation token if provided
  if (token) {
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation || invitation.used || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 });
    }
    role = invitation.role;
    await prisma.invitation.update({ where: { token }, data: { used: true } });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      role,
    },
  });

  const jwt = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "COLLABORATOR" | "CLIENT",
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });

  const cookie = setSessionCookie(jwt);
  response.cookies.set(cookie);

  return response;
}

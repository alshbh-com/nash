import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { clearSession, getRequestIP, getSession, updateSession } from "@tanstack/react-start/server";

const ADMIN_EMAIL = "admin@naseh.store";
const ADMIN_PASSWORD = "01278006248";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type AdminSession = {
  userId: string;
  email: string;
  expiresAt: number;
  ip?: string;
};

function sessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_DB_URL;
  if (!password || password.length < 32) throw new Error("إعدادات جلسة الأدمن غير مكتملة");

  return {
    password,
    name: "naseh-admin-session",
    maxAge: ADMIN_SESSION_MAX_AGE,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    },
  };
}

export async function ensureAdminAccount() {
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw new Error(listErr.message);

  const existing = list.users.find((user) => user.email === ADMIN_EMAIL);
  let userId: string;

  if (!existing) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(createErr?.message || "تعذّر إنشاء حساب الأدمن");
    userId = created.user.id;
  } else {
    userId = existing.id;
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) throw new Error(updateErr.message);
  }

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  return { userId, email: ADMIN_EMAIL };
}

export function isAdminPassword(password: string) {
  return password === ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const admin = await ensureAdminAccount();
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  await updateSession<AdminSession>(sessionConfig(), {
    userId: admin.userId,
    email: admin.email,
    expiresAt,
    ip: getRequestIP({ xForwardedFor: true }),
  });
  return { ok: true, email: admin.email, expiresAt };
}

export async function readAdminSession() {
  const session = await getSession<AdminSession>(sessionConfig());
  const data = session.data;

  if (!data?.userId || !data.expiresAt || data.expiresAt < Date.now()) {
    await clearSession(sessionConfig());
    return { authed: false as const };
  }

  const { data: role, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !role) {
    await clearSession(sessionConfig());
    return { authed: false as const };
  }

  return { authed: true as const, email: data.email, expiresAt: data.expiresAt };
}

export async function clearAdminSession() {
  await clearSession(sessionConfig());
  return { ok: true };
}
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "admin@naseh.store";
const ADMIN_PASSWORD = "01278006248";

export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  // Find existing user
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw new Error(listErr.message);
  const existing = list.users.find((u) => u.email === ADMIN_EMAIL);

  let userId: string;
  if (!existing) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(createErr?.message || "create failed");
    userId = created.user.id;
  } else {
    userId = existing.id;
    // Reset password + confirm email to ensure login works
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updErr) throw new Error(updErr.message);
  }

  // Ensure admin role
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  return { ok: true, email: ADMIN_EMAIL };
});

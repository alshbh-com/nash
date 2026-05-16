import { createServerFn } from "@tanstack/react-start";
import {
  clearAdminSession,
  createAdminSession,
  isAdminPassword,
  readAdminSession,
} from "./admin-auth.server";

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (!isAdminPassword(data.password)) throw new Error("كلمة المرور غير صحيحة");
    return createAdminSession();
  });

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  return readAdminSession();
});

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  return clearAdminSession();
});
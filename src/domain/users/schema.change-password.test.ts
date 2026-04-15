import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "@/domain/users/schema";

describe("changePasswordSchema", () => {
  it("aceita dados válidos", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "oldpass1",
      newPassword: "newpass2",
      confirmNewPassword: "newpass2",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita quando novas senhas não coincidem", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "oldpass1",
      newPassword: "newpass2",
      confirmNewPassword: "different",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita quando nova senha é igual à atual", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "same123",
      newPassword: "same123",
      confirmNewPassword: "same123",
    });
    expect(r.success).toBe(false);
  });
});

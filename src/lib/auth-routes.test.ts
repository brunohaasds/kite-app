import { describe, expect, it } from "vitest";
import {
  getAppHomePath,
  isSafeInternalPath,
  resolvePostLoginRedirect,
} from "@/lib/auth-routes";

describe("isSafeInternalPath", () => {
  it("aceita paths internos seguros", () => {
    expect(isSafeInternalPath("/aluno/aulas")).toBe(true);
    expect(isSafeInternalPath("/admin/agenda")).toBe(true);
  });

  it("rejeita open redirect", () => {
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("/javascript:alert(1)")).toBe(false);
  });
});

describe("getAppHomePath", () => {
  it("resolve por role", () => {
    expect(getAppHomePath("superadmin")).toBe("/super-admin");
    expect(getAppHomePath("admin")).toBe("/admin/agenda");
    expect(getAppHomePath("student")).toBe("/aluno/aulas");
  });
});

describe("resolvePostLoginRedirect", () => {
  it("usa callback seguro quando presente", () => {
    expect(resolvePostLoginRedirect("/centers", "student")).toBe("/centers");
  });

  it("ignora callback inseguro", () => {
    expect(resolvePostLoginRedirect("//x", "student")).toBe("/aluno/aulas");
  });
});

import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login - Kite App",
};

export default function LoginPage() {
  return <LoginClient />;
}

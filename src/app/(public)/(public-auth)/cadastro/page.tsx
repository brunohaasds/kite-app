import type { Metadata } from "next";
import { CadastroClient } from "./cadastro-client";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function CadastroPage() {
  return <CadastroClient />;
}

import { StudentProfileGate } from "@/components/student/student-profile-gate";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentProfileGate>{children}</StudentProfileGate>;
}

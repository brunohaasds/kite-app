"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MobileContainer } from "@/components/layout/mobile-container";
import {
  LogIn,
  UserPlus,
  Zap,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  User,
  Loader2,
} from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EXPERIENCE_LEVEL_LABELS, DEFAULT_BOOKING_RULES } from "@/lib/constants";

type Step = "auth" | "lesson-type" | "confirmation";

type LessonChoice =
  | { type: "avulsa" }
  | { type: "pacote_credito"; studentPackageId: number; packageTitle: string; remaining: number }
  | { type: "pacote_novo"; packageId: number; packageTitle: string; price: number };

interface StudentPackage {
  id: number;
  sessions_remaining: number;
  package: { title: string; price: number };
}

interface SlotData {
  id: number;
  time: string;
  date: string;
  dayName: string;
  spotName: string | null;
  instructorName: string | null;
}

interface OrgData {
  id: number;
  name: string;
  whatsapp: string | null;
}

interface PackageData {
  id: number;
  title: string;
  description: string | null;
  sessionCount: number;
  price: number;
  pricePerLesson: number;
  validityDays: number | null;
}

interface BookingWizardProps {
  slot: SlotData;
  org: OrgData;
  packages: PackageData[];
}

export function BookingWizard({ slot, org, packages }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [loading, setLoading] = useState(false);
  const [lessonChoice, setLessonChoice] = useState<LessonChoice | null>(null);
  const [studentPackages, setStudentPackages] = useState<StudentPackage[]>([]);

  // Auth form state
  const [authTab, setAuthTab] = useState<"existing" | "new">("new");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState("iniciante");

  async function fetchStudentPackages() {
    try {
      const res = await fetch("/api/student/packages");
      if (res.ok) {
        const data = await res.json();
        setStudentPackages(data.packages ?? []);
      }
    } catch {
      // Student may not have packages yet
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Email ou senha incorretos");
        return;
      }
      toast.success("Login realizado!");
      await fetchStudentPackages();
      setStep("lesson-type");
    } catch {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          level,
          orgId: org.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "email_exists") {
          toast.error("Este email já possui conta. Use a aba \"Já sou aluno\".");
          setAuthTab("existing");
          return;
        }
        toast.error(data.error || "Erro ao criar conta");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Conta criada, mas erro ao fazer login. Tente fazer login manualmente.");
        return;
      }

      toast.success("Conta criada com sucesso!");
      await fetchStudentPackages();
      setStep("lesson-type");
    } catch {
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAvulsa() {
    setLessonChoice({ type: "avulsa" });
    setStep("confirmation");
  }

  function handleSelectPackageCredit(sp: StudentPackage) {
    setLessonChoice({
      type: "pacote_credito",
      studentPackageId: sp.id,
      packageTitle: sp.package.title,
      remaining: sp.sessions_remaining,
    });
    setStep("confirmation");
  }

  function handleSelectNewPackage(pkg: PackageData) {
    setLessonChoice({
      type: "pacote_novo",
      packageId: pkg.id,
      packageTitle: pkg.title,
      price: pkg.price,
    });
    setStep("confirmation");
  }

  async function handleConfirmBooking() {
    if (!lessonChoice) return;
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        slotId: slot.id,
        orgId: org.id,
        lessonType: lessonChoice.type,
      };

      if (lessonChoice.type === "pacote_credito") {
        body.studentPackageId = lessonChoice.studentPackageId;
      } else if (lessonChoice.type === "pacote_novo") {
        body.packageId = lessonChoice.packageId;
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao agendar");
      }

      toast.success("Agendamento confirmado!");
      router.push("/aluno/aulas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao confirmar agendamento");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (step === "lesson-type") {
      setStep("auth");
    } else if (step === "confirmation") {
      setStep("lesson-type");
      setLessonChoice(null);
    }
  }

  const stepIndex = step === "auth" ? 0 : step === "lesson-type" ? 1 : 2;

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Header */}
        <div className="rounded-b-3xl bg-primary p-6 text-primary-foreground shadow-lg">
          <h1 className="mb-1 text-2xl font-bold">Agendar Aula</h1>
          <p className="text-sm opacity-90">
            {org.name} &middot; {slot.dayName}, {formatDate(slot.date)} &middot; {slot.time}
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Progress indicator */}
          <ProgressBar step={stepIndex} />

          {/* Step 1: Auth */}
          {step === "auth" && (
            <div className="space-y-6">
              <Tabs
                value={authTab}
                onValueChange={(v) => setAuthTab(v as "existing" | "new")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Já sou aluno
                  </TabsTrigger>
                  <TabsTrigger value="new" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo aluno
                  </TabsTrigger>
                </TabsList>

                {/* Existing student login */}
                <TabsContent value="existing" className="mt-6">
                  <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Senha</Label>
                      <Input
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <Button
                      onClick={handleLogin}
                      disabled={loading}
                      className="h-12 w-full gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Entrar <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* New student register */}
                <TabsContent value="new" className="mt-6">
                  <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="space-y-2">
                      <Label className="font-semibold">Nome completo</Label>
                      <Input
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">WhatsApp</Label>
                      <Input
                        type="tel"
                        placeholder="(85) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Senha</Label>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-semibold">Nível de experiência</Label>
                      <RadioGroup
                        value={level}
                        onValueChange={setLevel}
                        className="space-y-2"
                      >
                        {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                          <div
                            key={value}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <RadioGroupItem value={value} id={`level-${value}`} />
                            <Label
                              htmlFor={`level-${value}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button
                      onClick={handleRegister}
                      disabled={loading}
                      className="h-12 w-full gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Criar Conta <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 2: Lesson type */}
          {step === "lesson-type" && (
            <div className="space-y-6">
              <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                {authTab === "existing"
                  ? "Bem-vindo de volta! Escolha como deseja agendar sua aula."
                  : "Conta criada! Agora escolha como deseja agendar."}
              </p>

              {/* Active package credits */}
              {studentPackages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-lg font-bold">Seus créditos</p>
                  {studentPackages.map((sp) => (
                    <Button
                      key={sp.id}
                      variant="outline"
                      className="flex h-auto w-full items-start justify-between p-5 text-left transition-all hover:shadow-md"
                      onClick={() => handleSelectPackageCredit(sp)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-base font-bold">{sp.package.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {sp.sessions_remaining} crédito{sp.sessions_remaining > 1 ? "s" : ""} restante{sp.sessions_remaining > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Single lesson */}
              <Button
                variant="outline"
                className="flex h-auto w-full items-start justify-between p-5 text-left transition-all hover:shadow-md"
                onClick={handleSelectAvulsa}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold">Aula Avulsa</p>
                    <p className="text-sm text-muted-foreground">Pagar por aula individual</p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary" />
              </Button>

              {/* School packages */}
              {packages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-lg font-bold">Pacotes com desconto</p>
                  {packages.map((pkg, i) => (
                    <Button
                      key={pkg.id}
                      variant="outline"
                      className="relative flex h-auto w-full items-start justify-between p-5 text-left transition-all hover:shadow-md"
                      onClick={() => handleSelectNewPackage(pkg)}
                    >
                      {i === 0 && packages.length > 1 && (
                        <Badge className="absolute right-3 top-3">Popular</Badge>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-bold">{pkg.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.sessionCount} aulas &middot; {formatCurrency(pkg.pricePerLesson)}/aula
                          </p>
                          <p className="mt-1 font-bold text-primary">
                            {formatCurrency(pkg.price)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    </Button>
                  ))}
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && lessonChoice && (
            <div className="space-y-6">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950/30">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
                <p className="mb-1 text-lg font-bold">Tudo pronto!</p>
                <p className="text-sm text-muted-foreground">
                  Revise os detalhes e confirme seu agendamento
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SummaryRow
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    label="Data"
                    value={`${slot.dayName}, ${formatDate(slot.date)}`}
                  />
                  <SummaryRow
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    label="Horário"
                    value={slot.time}
                  />
                  {slot.spotName && (
                    <SummaryRow
                      icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                      label="Local"
                      value={slot.spotName}
                    />
                  )}
                  {slot.instructorName && (
                    <SummaryRow
                      icon={<User className="h-4 w-4 text-muted-foreground" />}
                      label="Instrutor"
                      value={slot.instructorName}
                    />
                  )}
                  <div className="border-t pt-4">
                    <SummaryRow
                      icon={<Zap className="h-4 w-4 text-muted-foreground" />}
                      label="Tipo de Aula"
                      value={
                        lessonChoice.type === "avulsa"
                          ? "Aula Avulsa"
                          : lessonChoice.type === "pacote_credito"
                            ? `Crédito: ${lessonChoice.packageTitle}`
                            : `Pacote: ${lessonChoice.packageTitle}`
                      }
                    />
                  </div>
                  {lessonChoice.type === "pacote_credito" && (
                    <p className="text-sm text-muted-foreground">
                      Restante após uso: {lessonChoice.remaining - 1} crédito{lessonChoice.remaining - 1 !== 1 ? "s" : ""}
                    </p>
                  )}
                  {lessonChoice.type === "pacote_novo" && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-muted-foreground">Valor do pacote</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(lessonChoice.price)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking rules */}
              <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                <p className="font-semibold">Informações Importantes:</p>
                <ul className="space-y-1 text-muted-foreground">
                  {DEFAULT_BOOKING_RULES.map((rule) => (
                    <li key={rule}>&bull; {rule}</li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="h-14 w-full gap-2 text-base"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirmar Agendamento
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

/* ----- Sub-components ----- */

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-1 items-center">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              i < step
                ? "bg-green-500 text-white"
                : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
          </div>
          {i < 2 && (
            <div
              className={`mx-2 h-1 flex-1 rounded transition-colors ${
                i < step ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon} {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

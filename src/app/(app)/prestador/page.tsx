import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/rbac/require-permission";
import { findServiceByUserId, listBookingsForService } from "@/domain/services/repo";
import { PrestadorClient } from "./prestador-client";

export default async function PrestadorPedidosPage() {
  const session = await requireAuth();
  if (session.user.role !== "service_provider") {
    redirect("/login");
  }

  const service = await findServiceByUserId(Number(session.user.id));
  if (!service) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Seu usuário ainda não tem um cadastro de prestador vinculado. Fale com o suporte.
      </div>
    );
  }

  const raw = await listBookingsForService(service.id);
  const bookings = raw.map((b) => ({
    id: b.id,
    status: b.status,
    notes: b.notes,
    created_at: b.created_at.toISOString(),
    student: b.student,
    session: b.session
      ? {
          date: b.session.date.toISOString(),
          start_time: b.session.start_time,
          organization: b.session.organization,
          spot: b.session.spot,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">{service.display_name}</p>
      </div>
      <PrestadorClient bookings={bookings} />
    </div>
  );
}

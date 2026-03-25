"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MessageCircle, ExternalLink } from "@/lib/icons";

type UserLite = { name: string; phone: string | null; email: string };

type ServiceRow = {
  id: number;
  display_name: string;
  bio: string | null;
  whatsapp: string | null;
  instagram: string | null;
  avatar: string | null;
  type: string;
  user: UserLite;
};

type Props = {
  service: ServiceRow;
  canRequest: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  photographer: "Fotógrafo",
  filmmaker: "Filmmaker",
};

export function PartnerServiceCard({ service, canRequest }: Props) {
  const [loading, setLoading] = useState(false);

  async function requestService() {
    setLoading(true);
    try {
      const res = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Não foi possível enviar o pedido");
        return;
      }
      toast.success("Pedido enviado! O prestador vai receber em Pedidos.");
    } finally {
      setLoading(false);
    }
  }

  const label = TYPE_LABEL[service.type] ?? service.type;
  const wa = service.whatsapp?.replace(/\D/g, "");

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <UserAvatar name={service.display_name} imageUrl={service.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <h3 className="font-semibold">{service.display_name}</h3>
          {service.bio && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{service.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="outline" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            )}
            {service.instagram && (
              <a
                href={`https://instagram.com/${service.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="ghost" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  @{service.instagram.replace(/^@/, "")}
                </Button>
              </a>
            )}
            {canRequest && (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={requestService}
              >
                {loading ? "Enviando…" : "Pedir serviço"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

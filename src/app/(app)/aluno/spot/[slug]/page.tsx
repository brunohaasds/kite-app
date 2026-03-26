export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { findBySlug } from "@/domain/global-spots/repo";
import { SpotDetailPage } from "@/components/spot/spot-detail-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const spot = await findBySlug(slug);
  if (!spot) return { title: "Spot não encontrado" };
  return { title: spot.name };
}

export default async function AlunoSpotPage({ params }: Props) {
  const { slug } = await params;
  return (
    <SpotDetailPage slug={slug} pathPrefix="/aluno" backHref="/aluno/spots" />
  );
}

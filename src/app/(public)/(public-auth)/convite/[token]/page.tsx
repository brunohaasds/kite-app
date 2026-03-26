import { ConviteAcceptClient } from "./convite-accept-client";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ConviteAcceptPage({ params }: Props) {
  const { token } = await params;
  return <ConviteAcceptClient token={token} />;
}

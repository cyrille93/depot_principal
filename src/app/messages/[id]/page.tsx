import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getConversation } from "@/lib/messages";
import { ConversationClient } from "@/components/ConversationClient";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const conv = await getConversation(id, session.user.id);
  if (!conv) notFound();

  return (
    <ConversationClient
      conversationId={conv.id}
      autreId={conv.autreId}
      autrePseudo={conv.autrePseudo}
      annonceTitre={conv.annonceTitre}
      initial={conv.messages}
      jeBloque={conv.jeBloque}
      ilMeBloque={conv.ilMeBloque}
      autreEstAdmin={conv.autreEstAdmin}
    />
  );
}

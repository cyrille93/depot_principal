"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { listerNotifications, type NotifUI } from "@/lib/notifications";

export async function chargerNotifications(): Promise<{ connecte: boolean; items: NotifUI[]; nonLus: number }> {
  const session = await auth();
  if (!session?.user) return { connecte: false, items: [], nonLus: 0 };
  const { items, nonLus } = await listerNotifications(session.user.id);
  return { connecte: true, items, nonLus };
}

export async function marquerNotifsLues(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) return { ok: false };
  await db.notification.updateMany({ where: { userId: session.user.id, lu: false }, data: { lu: true } });
  return { ok: true };
}

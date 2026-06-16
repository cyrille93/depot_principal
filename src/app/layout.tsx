import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AgeGate } from "@/components/AgeGate";
import { Presence } from "@/components/Presence";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Rose Annonce — annonces vérifiées au Cameroun",
  description:
    "La marketplace de mise en relation vérifiée : profils contrôlés, avis réels, paiement Mobile Money. Douala, Yaoundé et tout le Cameroun.",
  icons: { icon: "/logo-rose-icon.png", apple: "/logo-rose-icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="preconnect"
          href="https://rsms.me"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <AgeGate />
        <Presence />
        <ToastProvider>{children}</ToastProvider>
        <BottomNav />
      </body>
    </html>
  );
}

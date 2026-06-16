"use client";

import { useRef, useState } from "react";
import { Wand2, Plus, X, ScanFace } from "lucide-react";

type Zone = { id: string; x: number; y: number; w: number; h: number };

const DEF_W = 24;
const DEF_H = 30;
const MIN = 10;
const NIVEAUX = [
  { cle: "leger", label: "Léger", px: 4 },
  { cle: "moyen", label: "Moyen", px: 8 },
  { cle: "fort", label: "Fort", px: 14 },
] as const;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

let seq = 0;

export function FloutageEditor({
  initial,
  image,
  onClose,
  onSave,
}: {
  initial: number;
  image?: string;
  onClose: () => void;
  onSave: (count: number) => void;
}) {
  const [zones, setZones] = useState<Zone[]>(
    Array.from({ length: initial }, (_, i) => ({ id: `z${seq++}`, x: 12 + i * 28, y: 22, w: DEF_W, h: DEF_H }))
  );
  const [niveau, setNiveau] = useState<(typeof NIVEAUX)[number]["cle"]>("moyen");
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; mode: "move" | "resize"; sx: number; sy: number; zx: number; zy: number; zw: number; zh: number } | null>(null);

  const px = NIVEAUX.find((n) => n.cle === niveau)!.px;

  const detecter = () =>
    setZones([
      { id: `z${seq++}`, x: 20, y: 16, w: DEF_W, h: DEF_H },
      { id: `z${seq++}`, x: 54, y: 28, w: DEF_W, h: DEF_H },
    ]);

  const ajouter = () => setZones((z) => [...z, { id: `z${seq++}`, x: 34, y: 30, w: 30, h: 28 }]);
  const retirer = (id: string) => setZones((z) => z.filter((zz) => zz.id !== id));

  const onPointerDown = (e: React.PointerEvent, z: Zone, mode: "move" | "resize") => {
    e.stopPropagation();
    drag.current = { id: z.id, mode, sx: e.clientX, sy: e.clientY, zx: z.x, zy: z.y, zw: z.w, zh: z.h };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = ((e.clientX - d.sx) / rect.width) * 100;
    const dy = ((e.clientY - d.sy) / rect.height) * 100;
    setZones((zs) =>
      zs.map((z) => {
        if (z.id !== d.id) return z;
        if (d.mode === "move") {
          return { ...z, x: clamp(d.zx + dx, 0, 100 - z.w), y: clamp(d.zy + dy, 0, 100 - z.h) };
        }
        return { ...z, w: clamp(d.zw + dx, MIN, 100 - z.x), h: clamp(d.zh + dy, MIN, 100 - z.y) };
      })
    );
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foret-fonce/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-carte bg-carte p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-medium text-principal">Flouter (visage ou partie du corps)</h3>
          <button onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5 text-secondaire" />
          </button>
        </div>
        <p className="mb-3 text-xs text-secondaire">
          Ajoutez une zone, placez-la sur ce que vous voulez masquer et redimensionnez-la avec le coin.
        </p>

        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-petit bg-media"
          style={image ? undefined : { background: "repeating-linear-gradient(135deg,#E7EDE3 0 8px,#DEE7D9 8px 16px)" }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-tertiaire">
              <span className="text-xs">aperçu de la photo</span>
            </div>
          )}

          {zones.map((z) => (
            <div
              key={z.id}
              onPointerDown={(e) => onPointerDown(e, z, "move")}
              className="absolute cursor-move rounded-petit border-2 border-feuille"
              style={{
                left: `${z.x}%`,
                top: `${z.y}%`,
                width: `${z.w}%`,
                height: `${z.h}%`,
                backdropFilter: `blur(${px}px)`,
                WebkitBackdropFilter: `blur(${px}px)`,
                background: "rgba(30,168,91,0.10)",
              }}
            >
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => retirer(z.id)}
                aria-label="Retirer la zone"
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-pill bg-carte text-secondaire shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
              {/* Poignée de redimensionnement */}
              <span
                onPointerDown={(e) => onPointerDown(e, z, "resize")}
                className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-se-resize rounded-pill border-2 border-feuille bg-carte"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={detecter}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-champ bg-feuille px-3 py-2 text-sm font-medium text-sur-vert"
          >
            <Wand2 className="h-4 w-4" /> Détection auto du visage
          </button>
          <button
            onClick={ajouter}
            className="flex items-center justify-center gap-1.5 rounded-champ border border-bordure px-3 py-2 text-sm text-principal"
          >
            <Plus className="h-4 w-4" /> Zone
          </button>
        </div>

        <div className="mt-3">
          <span className="mb-1.5 block text-xs text-secondaire">Niveau de flou</span>
          <div className="flex gap-1 rounded-pill bg-pill-fond p-1">
            {NIVEAUX.map((n) => (
              <button
                key={n.cle}
                onClick={() => setNiveau(n.cle)}
                className={"flex-1 rounded-pill py-1.5 text-xs " + (niveau === n.cle ? "bg-carte font-medium text-principal" : "text-pill-texte")}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-secondaire">
          <ScanFace className="h-4 w-4 text-action-verte" />
          {zones.length === 0 ? "Aucune zone — rien ne sera flouté." : `${zones.length} zone(s) floutée(s).`}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-champ border border-bordure py-2.5 text-sm text-principal">
            Annuler
          </button>
          <button onClick={() => onSave(zones.length)} className="flex-1 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

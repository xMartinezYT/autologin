"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Wand2,
  Crown,
  Wrench,
  Brain,
  Rocket,
  FlaskConical,
  ExternalLink,
  Trophy,
  Sparkles,
  Filter,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/**
 * /panel – Panel de herramientas con buscador, filtros por categorías
 * y grid de módulos. Pensado para copiar/pegar tal cual en una ruta /panel
 * de Next.js/React. Diseño oscuro, moderno, con glassmorphism.
 *
 * Cómo añadir o editar módulos:
 *  1) Añade un objeto al array TOOLS con { id, title, description, category, icon, loginUrl, status? , tags? }
 *  2) La propiedad `loginUrl` es donde se redirige al hacer click en la card.
 *  3) Las categorías válidas por defecto: "All", "Ecom", "AI", "Design", "Others".
 *  4) Puedes duplicar estilos o badges sin miedo. Está todo tipado abajo en `Tool`.
 */

type Category = "All" | "Ecom" | "AI" | "Design" | "Others";

type Tool = {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, "All">;
  icon: React.ElementType;
  loginUrl: string;
  status?: { label: string; tone: "new" | "experimental" | "unstable" };
  tags?: string[]; // etiquetas pequeñas (texto corto)
};

const TOOLS: Tool[] = [
  {
    id: "bonus",
    title: "30+ Bonus Tools",
    description:
      "Colección que reúne Semrush, Keywordtools.io, Envato Elements, Moz, QuillBot y más imprescindibles.",
    category: "Ecom",
    icon: Wrench,
    loginUrl: "https://example.com/bonus-tools/login",
    status: { label: "Can be unstable", tone: "unstable" },
    tags: ["NS", "S", "QBot", "Moz"],
  },
  {
    id: "gethookd",
    title: "GetHookd",
    description:
      "Detecta creatividades top al instante. Filtra por nicho, ROAS y estilo para inspirar tu próxima campaña.",
    category: "Ecom",
    icon: Trophy,
    loginUrl: "https://example.com/gethookd/login",
    status: { label: "Newly Added", tone: "new" },
  },
  {
    id: "pipiads",
    title: "PipiAds",
    description:
      "Espía anuncios en Facebook, TikTok y TikTok Shop; analiza estrategias publicitarias de la competencia.",
    category: "Ecom",
    icon: Rocket,
    loginUrl: "https://example.com/pipiads/login",
  },
  {
    id: "gemini",
    title: "Gemini",
    description:
      "Asistente de Google impulsado por modelos Gemini. Imagen + razonamiento mejorado.",
    category: "AI",
    icon: Brain,
    loginUrl: "https://gemini.google.com/",
    status: { label: "Experimental", tone: "experimental" },
  },
  {
    id: "winninghunter",
    title: "WinningHunter",
    description:
      "Encuentra productos ganadores para dropshipping con datos y señales sociales.",
    category: "Ecom",
    icon: Crown,
    loginUrl: "https://example.com/winninghunter/login",
  },
  {
    id: "kalodata",
    title: "Kalodata",
    description:
      "Tendencias de TikTok Shop, análisis de influencers y videoteca para inspirarte.",
    category: "Ecom",
    icon: Layers,
    loginUrl: "https://example.com/kalodata/login",
  },
  {
    id: "heygen",
    title: "HeyGen",
    description:
      "Crea, traduce y personaliza vídeos con IA en cuestión de minutos.",
    category: "Design",
    icon: ImageIcon,
    loginUrl: "https://app.heygen.com/login",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    description:
      "Respuestas veloces, plugins y acceso prioritario. Tu copiloto para todo.",
    category: "AI",
    icon: Sparkles,
    loginUrl: "https://chat.openai.com/auth/login",
  },
  {
    id: "lab",
    title: "AI Lab",
    description:
      "Banco de pruebas para ideas raras y prototipos rápidos. Toca y aprende.",
    category: "Others",
    icon: FlaskConical,
    loginUrl: "https://example.com/lab/login",
    status: { label: "Beta", tone: "experimental" },
  },
];

const CATEGORIES: Category[] = ["All", "Ecom", "AI", "Design", "Others"];

const toneClass: Record<NonNullable<Tool["status"]>["tone"], string> = {
  new: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  experimental: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  unstable: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

export default function PanelPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category>("All");

  const filtered = useMemo(() => {
    const list = activeCat === "All" ? TOOLS : TOOLS.filter(t => t.category === activeCat);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [query, activeCat]);

  const counts = useMemo(() => {
    const base: Record<Category, number> = { All: TOOLS.length, Ecom: 0, AI: 0, Design: 0, Others: 0 };
    for (const t of TOOLS) base[t.category]++;
    return base;
  }, []);

  return (
    <div className="relative min-h-screen text-white bg-[#0b1220] overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_60%)] blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
              <ShieldCheck className="h-6 w-6 text-blue-300" />
            </div>
            <div className="leading-tight">
              <p className="text-sm text-white/60">Panel</p>
              <h1 className="text-xl font-semibold tracking-tight">EcomPro</h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" className="gap-2 text-white/80 hover:text-white">
              <Wand2 className="h-4 w-4" /> Mejoras
            </Button>
          </div>
        </div>
      </header>

      {/* Search + filters */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una herramienta…"
              className="w-full bg-white/5 text-white placeholder:text-white/40 border-white/10 pl-12 h-12 rounded-2xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={
                  "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition " +
                  (activeCat === cat
                    ? "bg-white/15 ring-1 ring-white/20"
                    : "bg-white/5 hover:bg-white/10 ring-1 ring-white/10")
                }
              >
                <span>{cat === "All" ? "Todo" : cat}</span>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-black/50 text-[11px] text-white/80">
                  {counts[cat]}
                </span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-white/60 text-sm">
              <Filter className="h-4 w-4" /> {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filtered.map((tool, idx) => (
            <motion.a
              key={tool.id}
              href={tool.loginUrl}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="no-underline"
            >
              <Card className="relative h-full overflow-hidden rounded-2xl border-white/10 bg-gradient-to-b from-white/5 to-white/2 hover:from-white/10 hover:to-white/5 transition">
                {/* status badge */}
                {tool.status && (
                  <div className="absolute right-3 top-3 z-10">
                    <div className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClass[tool.status.tone]}`}>
                      {tool.status.label}
                    </div>
                  </div>
                )}

                {/* subtle glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)] blur-2xl" />
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold tracking-tight">{tool.title}</h3>
                      <p className="mt-1 line-clamp-3 text-sm text-white/70">{tool.description}</p>

                      {tool.tags && tool.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tool.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="bg-white/10 text-white/80 border-white/10">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-white/50">{tool.category}</div>
                    <div className="inline-flex items-center gap-1 text-sm text-white/80">
                      Ir al login <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-16 grid place-items-center text-center">
            <div className="max-w-md">
              <p className="text-lg font-medium">Nada por aquí…</p>
              <p className="mt-1 text-white/70">
                Prueba a cambiar la categoría o a usar otros términos en el buscador.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Consejito: para añadir nuevos módulos, copia uno del array <code>TOOLS</code> y cambia título, descripción y <code>loginUrl</code>.
        </div>
      </footer>
    </div>
  );
}

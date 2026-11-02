import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Search, Layers, FileText, History, MapPin, Printer, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CAPAS, PREDIOS, type Predio } from "@/lib/geo-data";
import { analizar, buscarPredio, type Informe } from "@/lib/viabilidad";

const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoViabilidad — Visor de restricciones ambientales prediales" },
      { name: "description", content: "Consulte por FMI o cédula catastral las restricciones ambientales de un predio y genere su informe de viabilidad." },
      { property: "og:title", content: "GeoViabilidad — Visor geoespacial predial" },
      { property: "og:description", content: "Informes automáticos de viabilidad predial con capas ambientales y catastrales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tab = "consulta" | "capas" | "historial";
type Hist = { fmi: string; dictamen: string; fecha: string };

const dictamenColor = { Viable: "bg-success text-primary-foreground", "Viable con condiciones": "bg-warning text-accent-foreground", "No viable": "bg-destructive text-destructive-foreground" } as const;

function Index() {
  const [tab, setTab] = useState<Tab>("consulta");
  const [q, setQ] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState("");
  const [informe, setInforme] = useState<Informe>();
  const [marcador, setMarcador] = useState<[number, number]>();
  const [visibles, setVisibles] = useState<Record<string, boolean>>(Object.fromEntries(CAPAS.map((c) => [c.id, true])));
  const [hist, setHist] = useState<Hist[]>([]);

  useEffect(() => {
    try { setHist(JSON.parse(localStorage.getItem("geo-historial") ?? "[]")); } catch { /* vacío */ }
  }, []);

  const seleccionar = (p: Predio) => {
    const inf = analizar(p);
    setInforme(inf);
    setError("");
    setTab("consulta");
    const h = [{ fmi: p.fmi, dictamen: inf.dictamen, fecha: inf.fecha }, ...hist].slice(0, 20);
    setHist(h);
    localStorage.setItem("geo-historial", JSON.stringify(h));
  };

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const p = buscarPredio(q);
    if (p) seleccionar(p);
    else setError("No se encontró un predio con ese FMI o cédula catastral.");
  };

  const irCoord = (e: React.FormEvent) => {
    e.preventDefault();
    const la = parseFloat(lat), lo = parseFloat(lng);
    if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return setError("Coordenadas inválidas (use grados decimales WGS84).");
    setError("");
    setMarcador([la, lo]);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="no-print flex items-center justify-between border-b border-sidebar-border bg-sidebar px-5 py-3 text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-sidebar-primary" />
          <h1 className="text-lg font-semibold tracking-tight">GeoViabilidad</h1>
          <span className="hidden text-xs opacity-70 sm:inline">Ordenamiento territorial y gestión ambiental</span>
        </div>
        <span className="font-mono text-xs opacity-70">Datos de demostración · Villavicencio, Meta</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="no-print flex w-full flex-col border-r border-border bg-card md:w-[400px]">
          <nav className="grid grid-cols-3 border-b border-border">
            {([["consulta", Search, "Consulta"], ["capas", Layers, "Capas"], ["historial", History, "Historial"]] as const).map(([id, Icon, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${tab === id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === "consulta" && (
              <div className="space-y-6">
                <form onSubmit={buscar} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FMI o cédula catastral</label>
                  <div className="flex gap-2">
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. 230-118870" className="font-mono" />
                    <Button type="submit"><Search className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PREDIOS.map((p) => (
                      <button type="button" key={p.fmi} onClick={() => { setQ(p.fmi); seleccionar(p); }} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground">{p.fmi}</button>
                    ))}
                  </div>
                </form>

                <form onSubmit={irCoord} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Búsqueda por coordenadas</label>
                  <div className="flex gap-2">
                    <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitud" className="font-mono" />
                    <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitud" className="font-mono" />
                    <Button type="submit" variant="secondary"><MapPin className="h-4 w-4" /></Button>
                  </div>
                </form>

                {error && <p className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

                {informe ? <Resumen informe={informe} /> : (
                  <p className="text-sm text-muted-foreground">Busque un predio o haga clic sobre uno en el mapa para generar su informe de viabilidad.</p>
                )}
              </div>
            )}

            {tab === "capas" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Capas de restricción ambiental</p>
                {CAPAS.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-start gap-3 rounded border border-border p-3 hover:bg-muted">
                    <input type="checkbox" checked={visibles[c.id]} onChange={(e) => setVisibles({ ...visibles, [c.id]: e.target.checked })} className="mt-1 accent-[var(--primary)]" />
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                    <span className="text-sm">
                      <span className="font-medium">{c.nombre}</span>
                      <span className="block text-xs text-muted-foreground">{c.tipo} · {c.severidad}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {tab === "historial" && (
              <div className="space-y-2">
                {hist.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay consultas.</p>}
                {hist.map((h, i) => (
                  <button key={i} onClick={() => { const p = buscarPredio(h.fmi); if (p) seleccionar(p); }} className="flex w-full items-center justify-between rounded border border-border p-3 text-left hover:bg-muted">
                    <span>
                      <span className="block font-mono text-sm">{h.fmi}</span>
                      <span className="text-xs text-muted-foreground">{new Date(h.fecha).toLocaleString("es-CO")}</span>
                    </span>
                    <Badge className={dictamenColor[h.dictamen as keyof typeof dictamenColor]}>{h.dictamen}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="no-print relative min-h-[50vh] flex-1">
          <ClientOnly fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Cargando mapa…</div>}>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Cargando mapa…</div>}>
              <MapView visibles={visibles} seleccionado={informe?.predio} marcador={marcador} onSelect={seleccionar} />
            </Suspense>
          </ClientOnly>
        </main>
      </div>

      {informe && <InformeImpreso informe={informe} />}
    </div>
  );
}

function Resumen({ informe }: { informe: Informe }) {
  const p = informe.predio;
  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-mono text-base font-semibold">FMI {p.fmi}</h2>
          <p className="text-xs text-muted-foreground">{p.vereda}, {p.municipio}</p>
        </div>
        <Badge className={dictamenColor[informe.dictamen]}>{informe.dictamen}</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Propietario</dt><dd>{p.propietario}</dd>
        <dt className="text-muted-foreground">Área</dt><dd className="font-mono">{informe.areaHa.toFixed(2)} ha</dd>
      </dl>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Afectaciones</h3>
        {informe.afectaciones.length === 0 ? <p className="text-sm">Sin restricciones ambientales identificadas.</p> : (
          <ul className="space-y-2">
            {informe.afectaciones.map((a) => (
              <li key={a.capa.id} className="text-sm">
                <div className="flex justify-between"><span className="font-medium">{a.capa.nombre}</span><span className="font-mono">{a.porcentaje.toFixed(1)}%</span></div>
                <div className="mt-1 h-1.5 rounded bg-muted"><div className="h-full rounded" style={{ width: `${Math.min(a.porcentaje, 100)}%`, background: a.capa.color }} /></div>
                <span className="text-xs text-muted-foreground">{a.capa.severidad} · {a.areaHa.toFixed(2)} ha</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button className="w-full" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Imprimir / guardar PDF</Button>
    </section>
  );
}

function InformeImpreso({ informe }: { informe: Informe }) {
  const p = informe.predio;
  return (
    <div className="print-only hidden p-10 text-foreground">
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
        <FileText className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-semibold">Informe de viabilidad predial</h1>
          <p className="text-sm text-muted-foreground">Generado el {new Date(informe.fecha).toLocaleString("es-CO")} · Consecutivo GV-{informe.fecha.slice(0, 10).replace(/-/g, "")}-{p.fmi.slice(-4)}</p>
        </div>
      </div>
      <table className="mb-6 w-full text-sm">
        <tbody>
          {[["Folio de Matrícula Inmobiliaria", p.fmi], ["Cédula catastral", p.cedula], ["Propietario", p.propietario], ["Ubicación", `${p.vereda}, ${p.municipio}`], ["Área", `${informe.areaHa.toFixed(2)} ha`], ["Dictamen", informe.dictamen]].map(([k, v]) => (
            <tr key={k} className="border-b border-border"><td className="py-2 font-medium">{k}</td><td className="py-2 font-mono">{v}</td></tr>
          ))}
        </tbody>
      </table>
      <h2 className="mb-2 text-lg font-semibold">Determinantes ambientales</h2>
      {informe.afectaciones.length === 0 ? <p>No se identificaron traslapes con capas de restricción.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left"><th className="py-2">Capa</th><th>Tipo</th><th>Régimen</th><th>Área (ha)</th><th>%</th><th>Norma</th></tr></thead>
          <tbody>
            {informe.afectaciones.map((a) => (
              <tr key={a.capa.id} className="border-b border-border"><td className="py-2">{a.capa.nombre}</td><td>{a.capa.tipo}</td><td>{a.capa.severidad}</td><td className="font-mono">{a.areaHa.toFixed(2)}</td><td className="font-mono">{a.porcentaje.toFixed(1)}</td><td>{a.capa.norma}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-8 text-xs text-muted-foreground">Documento informativo generado con datos de demostración. No reemplaza certificados oficiales del IGAC ni de la autoridad ambiental competente.</p>
    </div>
  );
}

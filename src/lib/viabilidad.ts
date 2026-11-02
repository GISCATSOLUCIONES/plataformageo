import area from "@turf/area";
import intersect from "@turf/intersect";
import { featureCollection, feature } from "@turf/helpers";
import type { Polygon } from "geojson";
import { CAPAS, PREDIOS, type CapaRestriccion, type Predio } from "./geo-data";

export type Afectacion = { capa: CapaRestriccion; areaHa: number; porcentaje: number };
export type Dictamen = "Viable" | "Viable con condiciones" | "No viable";
export type Informe = { predio: Predio; areaHa: number; afectaciones: Afectacion[]; dictamen: Dictamen; fecha: string };

export function buscarPredio(q: string): Predio | undefined {
  const t = q.trim().replace(/\s/g, "");
  if (!t) return undefined;
  return PREDIOS.find((p) => p.fmi === t || p.cedula === t || p.fmi.replace("-", "") === t.replace("-", ""));
}

export function dictaminar(afs: Afectacion[]): Dictamen {
  if (afs.some((a) => a.capa.severidad === "Prohibido" && a.porcentaje >= 50)) return "No viable";
  if (afs.length > 0) return "Viable con condiciones";
  return "Viable";
}

export function analizar(predio: Predio, capas: CapaRestriccion[] = CAPAS): Informe {
  const pf = feature<Polygon>(predio.geometry);
  const total = area(pf);
  const afectaciones: Afectacion[] = [];
  for (const capa of capas) {
    const inter = intersect(featureCollection([pf, capa.feature]));
    if (!inter) continue;
    const a = area(inter);
    if (a <= 0) continue;
    afectaciones.push({ capa, areaHa: a / 10000, porcentaje: (a / total) * 100 });
  }
  return { predio, areaHa: total / 10000, afectaciones, dictamen: dictaminar(afectaciones), fecha: new Date().toISOString() };
}

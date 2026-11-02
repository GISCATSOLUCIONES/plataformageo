// Datos de demostración (área rural de Villavicencio, Meta). Reemplazar por servicios WFS del IGAC / CAR.
import type { Feature, Polygon } from "geojson";

export type Predio = {
  fmi: string;
  cedula: string;
  propietario: string;
  vereda: string;
  municipio: string;
  geometry: Polygon;
};

export type CapaRestriccion = {
  id: string;
  nombre: string;
  tipo: "Parque Nacional" | "Reserva Hídrica" | "Comunidad Étnica" | "Determinante Municipal";
  color: string;
  severidad: "Prohibido" | "Condicionado" | "Consulta previa";
  norma: string;
  feature: Feature<Polygon>;
};

const rect = (lng: number, lat: number, w: number, h: number): Polygon => ({
  type: "Polygon",
  coordinates: [[[lng, lat], [lng + w, lat], [lng + w, lat + h], [lng, lat + h], [lng, lat]]],
});

const poly = (pts: [number, number][]): Feature<Polygon> => ({
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [[...pts, pts[0]!]] },
});

export const PREDIOS: Predio[] = [
  { fmi: "230-112345", cedula: "500010001000000010001000000000", propietario: "Agropecuaria El Ocoa S.A.S.", vereda: "Pipiral", municipio: "Villavicencio", geometry: rect(-73.705, 4.17, 0.012, 0.01) },
  { fmi: "230-118870", cedula: "500010001000000020015000000000", propietario: "María Fernanda Ruiz", vereda: "Buenavista", municipio: "Villavicencio", geometry: rect(-73.66, 4.155, 0.01, 0.009) },
  { fmi: "230-120044", cedula: "500010001000000030022000000000", propietario: "Inversiones Llano Grande", vereda: "Apiay", municipio: "Villavicencio", geometry: rect(-73.6, 4.1, 0.015, 0.012) },
  { fmi: "230-099812", cedula: "500010001000000040007000000000", propietario: "Resguardo Maguaré (comunal)", vereda: "La Concepción", municipio: "Villavicencio", geometry: rect(-73.56, 4.06, 0.012, 0.012) },
  { fmi: "230-131590", cedula: "500010001000000050031000000000", propietario: "Carlos Andrés Pardo", vereda: "Cocuy", municipio: "Villavicencio", geometry: rect(-73.69, 4.08, 0.008, 0.008) },
];

export const CAPAS: CapaRestriccion[] = [
  { id: "pnn", nombre: "PNN Chingaza (zona amortiguadora)", tipo: "Parque Nacional", color: "#3f8f5a", severidad: "Prohibido", norma: "Decreto 2811 de 1974; Decreto 1076 de 2015", feature: poly([[-73.74, 4.16], [-73.69, 4.2], [-73.7, 4.24], [-73.75, 4.22]]) },
  { id: "hidrica", nombre: "Reserva hídrica Quebrada Honda", tipo: "Reserva Hídrica", color: "#3a86c8", severidad: "Condicionado", norma: "Acuerdo CORMACARENA PS-GJ 1.2.42.2", feature: poly([[-73.67, 4.14], [-73.645, 4.15], [-73.62, 4.115], [-73.64, 4.105]]) },
  { id: "etnica", nombre: "Resguardo Indígena Maguaré", tipo: "Comunidad Étnica", color: "#c9822f", severidad: "Consulta previa", norma: "Ley 21 de 1991 (Convenio 169 OIT)", feature: poly([[-73.57, 4.05], [-73.54, 4.05], [-73.54, 4.08], [-73.57, 4.08]]) },
  { id: "pot", nombre: "Suelo de protección POT", tipo: "Determinante Municipal", color: "#b04a4a", severidad: "Condicionado", norma: "Acuerdo 287 de 2015 – POT Villavicencio", feature: poly([[-73.605, 4.095], [-73.59, 4.095], [-73.59, 4.106], [-73.605, 4.106]]) },
];

export const MAP_CENTER: [number, number] = [4.13, -73.64];

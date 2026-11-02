import { useEffect, useRef } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAPAS, MAP_CENTER, PREDIOS, type Predio } from "@/lib/geo-data";

type Props = {
  visibles: Record<string, boolean>;
  seleccionado?: Predio | undefined;
  marcador?: [number, number] | undefined;
  onSelect: (p: Predio) => void;
};

// Solo se monta en el navegador (ver ClientOnly en la página).
export default function MapView({ visibles, seleccionado, marcador, onSelect }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const lib = useRef<typeof L | null>(null);
  const capas = useRef<Record<string, L.Layer>>({});
  const predios = useRef<Record<string, L.GeoJSON>>({});
  const pin = useRef<L.Marker | null>(null);
  const onSel = useRef(onSelect);
  onSel.current = onSelect;

  useEffect(() => {
    let cancel = false;
    import("leaflet").then((mod) => {
      if (cancel || !el.current || map.current) return;
      const Lf = (mod.default ?? mod) as typeof L;
      lib.current = Lf;
      const m = Lf.map(el.current, { zoomControl: true }).setView(MAP_CENTER, 12);
      const osm = Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(m);
      const sat = Lf.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "© Esri" });
      Lf.control.layers({ Calles: osm, Satélite: sat }).addTo(m);
      Lf.control.scale({ imperial: false }).addTo(m);
      for (const c of CAPAS) {
        capas.current[c.id] = Lf.geoJSON(c.feature, { style: { color: c.color, weight: 1.5, fillOpacity: 0.28, dashArray: "4 3" } })
          .bindTooltip(`${c.nombre} · ${c.severidad}`);
      }
      for (const p of PREDIOS) {
        predios.current[p.fmi] = Lf.geoJSON(p.geometry, { style: { color: "#1f2a24", weight: 1.5, fillOpacity: 0.08 } })
          .bindTooltip(`FMI ${p.fmi}`)
          .on("click", () => onSel.current(p))
          .addTo(m);
      }
      map.current = m;
      setTimeout(() => m.invalidateSize(), 50);
    });
    return () => {
      cancel = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const [id, layer] of Object.entries(capas.current)) {
      if (visibles[id]) layer.addTo(m);
      else layer.remove();
    }
  });

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const [fmi, layer] of Object.entries(predios.current)) {
      const sel = fmi === seleccionado?.fmi;
      layer.setStyle({ color: sel ? "#d4891f" : "#1f2a24", weight: sel ? 3 : 1.5, fillOpacity: sel ? 0.25 : 0.08 });
      if (sel) {
        layer.bringToFront();
        m.flyToBounds(layer.getBounds(), { padding: [80, 80], maxZoom: 15 });
      }
    }
  }, [seleccionado]);

  useEffect(() => {
    const m = map.current, Lf = lib.current;
    if (!m || !Lf || !marcador) return;
    pin.current?.remove();
    pin.current = Lf.circleMarker(marcador, { radius: 8, color: "#d4891f", fillOpacity: 0.9 }).addTo(m) as unknown as L.Marker;
    m.flyTo(marcador, 15);
  }, [marcador]);

  return <div ref={el} className="h-full w-full" />;
}

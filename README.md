# GeoViabilidad

Visor geoespacial predial para consulta de restricciones ambientales y emisión de informes automáticos de viabilidad.

Busque un predio por **FMI** (folio de matrícula inmobiliaria) o por **cédula catastral**, o haga clic sobre él en el mapa. La plataforma calcula qué porcentaje del predio cae dentro de cada zona de restricción y emite un dictamen: **Viable**, **Viable con condiciones** o **No viable**.

## Funcionalidades

- Consulta por FMI, cédula catastral o coordenadas (WGS84, grados decimales).
- Mapa interactivo con capas de restricción ambiental (parques nacionales, reservas hídricas, comunidades étnicas, determinantes municipales) y vista de calles / satélite.
- Cálculo automático de área afectada (m² → hectáreas) y porcentaje de traslape por capa.
- Dictamen de viabilidad con régimen normativo aplicable a cada determinante.
- Informe imprimible / exportable a PDF con consecutivo.
- Historial de las últimas 20 consultas (guardado en el navegador).

## Reglas del dictamen

| Condición | Dictamen |
| --- | --- |
| Alguna capa con severidad `Prohibido` cubre 50 % o más del predio | No viable |
| Existe al menos un traslape con una capa de restricción | Viable con condiciones |
| Sin traslapes | Viable |

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, TypeScript, SSR)
- Tailwind CSS v4 + componentes shadcn/ui
- Leaflet para el visor de mapas
- Turf.js para geometría (área e intersección de polígonos)
- Vitest para las pruebas

## Puesta en marcha

```sh
npm install     # o: bun install
npm run dev     # entorno de desarrollo
npm run build   # build de producción
npm test        # pruebas
npm run lint    # análisis estático
```

## Estructura

```text
src/
  components/
    MapView.tsx      Visor Leaflet (solo navegador, montado tras la hidratación)
    ui/              Componentes de interfaz (shadcn/ui)
  lib/
    geo-data.ts      Predios y capas de restricción (datos de demostración)
    viabilidad.ts    Búsqueda, traslapes, áreas y dictamen
  routes/
    __root.tsx       Layout raíz
    index.tsx        Página principal (consulta, capas, historial)
  test/              Pruebas unitarias y de enrutamiento
```

## Datos de demostración

`src/lib/geo-data.ts` contiene predios y polígonos ficticios del área rural de Villavicencio (Meta). Son datos de relleno: para producción, reemplácelos por servicios WFS del IGAC, la CAR competente y el POT municipal.

El documento generado es informativo y no reemplaza los certificados oficiales del IGAC ni de la autoridad ambiental competente.

## Pendientes para una versión completa

Cuentas de usuario y roles, persistencia en línea del historial y los informes, carga de archivos geoespaciales (SHP/GeoJSON), mediciones sobre el mapa, pagos, radicación de trámites y correo electrónico.

## Proyecto en Lovable

Este código se generó en [Lovable](https://lovable.dev). Si lo conecta a GitHub desde el editor, los cambios hechos en Lovable se commitean en la rama sincronizada y sus commits vuelven al editor.

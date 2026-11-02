import { describe, it, expect } from "vitest";
import { analizar, buscarPredio } from "@/lib/viabilidad";

describe("viabilidad predial", () => {
  it("encuentra predio por FMI y por cédula", () => {
    expect(buscarPredio("230-118870")?.propietario).toBe("María Fernanda Ruiz");
    expect(buscarPredio("500010001000000040007000000000")?.fmi).toBe("230-099812");
  });
  it("predio sin restricciones es viable", () => {
    expect(analizar(buscarPredio("230-131590")!).dictamen).toBe("Viable");
  });
  it("predio en resguardo requiere condiciones", () => {
    const inf = analizar(buscarPredio("230-099812")!);
    expect(inf.dictamen).toBe("Viable con condiciones");
    expect(inf.afectaciones[0]?.capa.id).toBe("etnica");
  });
});

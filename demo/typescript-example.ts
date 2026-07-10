/**
 * Chartres Blue Theme Demo — TypeScript
 * A modern TypeScript sample with types, generics, enums, and async patterns.
 */

// === Enums & Types ===

enum CathedralColor {
  ChartresBlue = '#1A2A6C',
  Rose = '#9B1B30',
  Gold = '#C9A84C',
  Stone = '#8E8B82',
}

type RGBA = { r: number; g: number; b: number; a: number };

interface StainedGlass {
  readonly id: string;
  name: string;
  year: number;
  dominantColor: CathedralColor | string;
  pigments: string[];
  dimensions: { width: number; height: number };
}

// === Generic class ===

class GlassCatalogue<T extends StainedGlass> {
  private panels: Map<string, T> = new Map();

  add(panel: T): void {
    this.panels.set(panel.id, panel);
    console.log(`Added: ${panel.name}`);
  }

  find(id: string): T | undefined {
    return this.panels.get(id);
  }

  listByColor(color: CathedralColor): T[] {
    return [...this.panels.values()].filter(
      (panel) => panel.dominantColor === color
    );
  }

  /** Returns hex-to-RGBA conversion */
  static hexToRgba(hex: string, alpha: number = 1): RGBA | null {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return null;
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
      a: alpha,
    };
  }
}

// === Async util ===

async function fetchPanels(url: string): Promise<StainedGlass[]> {
  const response: Response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data: StainedGlass[] = await response.json();
  return data ?? [];
}

// === Decorator ===

function log(
  _target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.debug(`[${new Date().toISOString()}] → ${propertyKey}(${args.map(String).join(', ')})`);
    return original.apply(this, args);
  };
  return descriptor;
}

// === Main ===

async function main(): Promise<void> {
  const catalogue = new GlassCatalogue<StainedGlass>();

  catalogue.add({
    id: 'notre-dame-belle-verriere',
    name: 'Notre-Dame de la Belle-Verrière',
    year: 1194,
    dominantColor: CathedralColor.ChartresBlue,
    pigments: ['cobalt oxide', 'copper sulfate'],
    dimensions: { width: 240, height: 380 },
  });

  const blue = CathedralColor.ChartresBlue;
  const rgba = GlassCatalogue.hexToRgba(blue);
  console.log(`${blue} → rgba(${rgba?.r}, ${rgba?.g}, ${rgba?.b}, ${rgba?.a})`);

  // Edge cases
  const maybeNull: string | null = null;
  const optionalChaining = maybeNull?.length ?? -1;

  const templateLiteral = `Panels: ${catalogue.listByColor(CathedralColor.ChartresBlue).length}`;
  console.log(templateLiteral, optionalChaining);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
});

export { CathedralColor, GlassCatalogue, StainedGlass };
export type { RGBA };

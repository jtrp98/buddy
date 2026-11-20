/**
 * Shared pixel-art SVG rasterizer for JoinScene components.
 * Converts character grids into merged horizontal-run SVG paths so all
 * foreground elements share crisp integer texels and minimal DOM nodes.
 */

export interface PixelPath {
  color: string;
  d: string;
}

export const DEFAULT_PIXEL_OUTLINE = "#1a2238";

/** One SVG path per colour: merges contiguous horizontal runs into rectangles. */
export function gridToPaths(
  grid: string[],
  palette: Record<string, string>,
  outlineColor: string = DEFAULT_PIXEL_OUTLINE
): PixelPath[] {
  const byColor = new Map<string, string>();
  grid.forEach((line, y) => {
    let x = 0;
    while (x < line.length) {
      const ch = line[x];
      if (ch === "." || ch === " ") {
        x++;
        continue;
      }
      let run = 1;
      while (line[x + run] === ch) run++;
      const color = ch === "K" ? outlineColor : (palette[ch] ?? outlineColor);
      byColor.set(color, (byColor.get(color) ?? "") + `M${x} ${y}h${run}v1h-${run}z`);
      x += run;
    }
  });
  return Array.from(byColor, ([color, d]) => ({ color, d }));
}

/**
 * Pads a grid by one pixel on every side to reach `width`, then adds a 1px
 * 4-connected outline using `outlineChar` on every empty pixel touching content.
 */
export function padAndOutlineGrid(
  grid: string[],
  width: number,
  outlineChar = "K"
): string[] {
  const blank = ".".repeat(width);
  const padded = [blank, ...grid.map((l) => `.${l}.`), blank];
  const filled = (r: number, c: number) =>
    padded[r]?.[c] !== undefined &&
    padded[r][c] !== "." &&
    padded[r][c] !== " " &&
    padded[r][c] !== outlineChar;

  return padded.map((line, r) =>
    line
      .split("")
      .map((ch, c) =>
        ch === "." &&
        (filled(r - 1, c) || filled(r + 1, c) || filled(r, c - 1) || filled(r, c + 1))
          ? outlineChar
          : ch
      )
      .join("")
  );
}

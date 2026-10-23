import { ImageResponse } from "next/og";

export const alt = "X Íntimo — A primeira camada";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BANDS = [
  { name: "Pijamas", bg: "#1e2638", fg: "#f7f3ec" },
  { name: "Interiores", bg: "#e6cfc3", fg: "#1b1917" },
  { name: "Roupa térmica", bg: "#d3c3a7", fg: "#1b1917" },
  { name: "Meias", bg: "#6f1f2c", fg: "#f7f3ec" },
];

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f7f3ec", padding: 56, gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: "#45403a" }}>X ÍNTIMO</div>
          <div style={{ fontSize: 110, lineHeight: 0.9, color: "#1b1917", marginTop: 20 }}>A primeira</div>
          <div style={{ fontSize: 110, lineHeight: 0.9, color: "#b5341f", fontStyle: "italic" }}>camada.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 560 }}>
          {BANDS.map((b) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", flex: 1, background: b.bg, color: b.fg, fontSize: 52, paddingLeft: 36 }}>
              {b.name}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

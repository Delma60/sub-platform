import { ImageResponse } from "next/og";
export const alt = "Oja — fresh foodstuff delivered on schedule";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() { return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#FAF6EF", color: "#17251C" }}><div style={{ fontSize: 34, color: "#BC8A31" }}>OJA · FARM DIRECT</div><div style={{ marginTop: 32, maxWidth: 900, fontSize: 76, lineHeight: 1.05 }}>Fresh foodstuff, delivered on schedule.</div><div style={{ marginTop: 30, fontSize: 28, color: "#6B6558" }}>Flexible market boxes for every kitchen.</div></div>, size); }

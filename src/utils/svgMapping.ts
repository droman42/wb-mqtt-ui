export const svgMapping: Record<string, any> = {
  play: {
    paths: ["M8 5L19 12L8 19Z"]
  },
  pause: {
    paths: ["M6 5H10V19H6Z", "M14 5H18V19H14Z"]
  },
  stop: {
    paths: ["M6 6H18V18H6Z"]
  },
  audioTrack: {
    rect: { x: 2, y: 2, width: 20, height: 20, rx: 3, ry: 3, fill: "#000" },
    text: {
      x: 12, y: 12, fontSize: 6, fontWeight: 700, fontFamily: "Arial,Helvetica,sans-serif",
      fill: "#fff", textAnchor: "middle", dominantBaseline: "middle", content: "AUDIO"
    }
  },
  // Add more mappings as needed
}; 
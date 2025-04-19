// Create a shared template for text button SVGs
const createTextButtonSVG = (content: string) => ({
  viewBox: "0 0 140 24", // Fixed wider viewBox to accommodate longer text like "SUBTITLES"
  rect: { 
    x: "5%", 
    y: "10%", 
    width: "90%", 
    height: "80%", 
    rx: 3, 
    ry: 3, 
    fill: "#000" 
  },
  text: {
    x: "50%", 
    y: "50%", 
    "font-size": 14, 
    "font-weight": 700, 
    "font-family": "Arial,Helvetica,sans-serif",
    fill: "#fff", 
    "text-anchor": "middle", 
    "dominant-baseline": "middle", 
    content
  }
});

// Create a shared template for aspect ratio buttons
const createRatioButtonSVG = (ratio: string) => {
  // Parse the ratio string (e.g., "16:9", "4:3")
  const [width, height] = ratio.split(':').map(Number);
  
  // Calculate dimensions that maintain the aspect ratio
  const rectWidth = 20;
  const rectHeight = rectWidth * (height / width);
  
  return {
    viewBox: "0 0 24 24",
    rect: { 
      x: (24 - rectWidth) / 2, // Center horizontally
      y: (24 - rectHeight) / 2, // Center vertically
      width: rectWidth, 
      height: rectHeight, 
      rx: 2, 
      ry: 2, 
      stroke: "#000", 
      "stroke-width": 2, 
      fill: "none" 
    },
    text: { 
      x: 12, 
      y: 12, 
      "font-size": 5, 
      "text-anchor": "middle", 
      "dominant-baseline": "middle", 
      fill: "#000", 
      "font-weight": 700, 
      content: ratio
    }
  };
};

export const svgMapping: Record<string, any> = {
  power: {
    paths: ["M11 3h2v10h-2z", "M17.83 7.17l-1.42-1.42A7.007 7.007 0 0 1 19 11.5c0 3.86-3.14 7-7 7s-7-3.14-7-7a7.007 7.007 0 0 1 2.59-5.39L5.17 7.17A8.997 8.997 0 0 0 3 11.5c0 4.97 4.03 9 9 9s9-4.03 9-9a8.997 8.997 0 0 0-3.17-6.83z"]
  },
  power_on: {
    paths: ["M11 3h2v10h-2z", {"stroke-width": 2, stroke: "#000", fill: "none", d: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"}]
  },
  power_off: {
    paths: ["M11 3h2v10h-2z", "M17.83 7.17l-1.42-1.42A7.007 7.007 0 0 1 19 11.5c0 3.86-3.14 7-7 7s-7-3.14-7-7a7.007 7.007 0 0 1 2.59-5.39L5.17 7.17A8.997 8.997 0 0 0 3 11.5c0 4.97 4.03 9 9 9s9-4.03 9-9a8.997 8.997 0 0 0-3.17-6.83z"]
  },
  play: {
    paths: ["M8 5L19 12L8 19Z"]
  },
  pause: {
    paths: ["M6 5H10V19H6Z", "M14 5H18V19H14Z"]
  },
  play_pause: {
    paths: ["M4 4h3v16H4z", "M10 4l9 8-9 8z"]
  },
  stop: {
    paths: ["M6 6H18V18H6Z"]
  },
  tray: {
    paths: ["M3 16h18v2H3z", "M6 13l6-6 6 6z"]
  },
  chapter_minus: {
    paths: ["M1 4h3v16H1z", "M12 4l-7 8 7 8z", "M20 4l-7 8 7 8z"]
  },
  chapter_plus: {
    paths: ["M4 4l7 8-7 8z", "M12 4l7 8-7 8z", "M20 4h3v16h-3z"]
  },
  rewind_forward: {
    paths: ["M4 5L11 12L4 19Z", "M11 5L18 12L11 19Z"]
  },
  rewind_backward: {
    paths: ["M20 5L13 12L20 19Z", "M13 5L6 12L13 19Z"]
  },
  mute: {
    paths: ["M3 9v6h4l5 5V4L7 9H3z", {"stroke-width": 2, stroke: "#000", d: "M16 6L6 18"}]
  },
  letterbox: {
    viewBox: "0 0 24 24",
    rects: [
      // Main rectangle frame
      { 
        x: 2, 
        y: 6, 
        width: 20, 
        height: 12, 
        rx: 2, 
        ry: 2, 
        stroke: "#000", 
        "stroke-width": 2, 
        fill: "none" 
      },
      // Top bar
      { 
        x: 2, 
        y: 6, 
        width: 20, 
        height: 3, 
        fill: "#000" 
      },
      // Bottom bar
      { 
        x: 2, 
        y: 15, 
        width: 20, 
        height: 3, 
        fill: "#000" 
      }
    ]
  },
  ratio_16_9: createRatioButtonSVG("16:9"),
  ratio_4_3: createRatioButtonSVG("4:3"),
  audio: createTextButtonSVG("AUDIO"),
  subtitles: createTextButtonSVG("SUBTITLES"),
  cd: createTextButtonSVG("CD"),
  usb: createTextButtonSVG("USB"),
  phono: createTextButtonSVG("PHONO"),
  tuner: createTextButtonSVG("TUNER"),
  aux1: createTextButtonSVG("AUX1"),
  aux2: createTextButtonSVG("AUX2"),
  balanced: createTextButtonSVG("BALANCED"),
  stream: createTextButtonSVG("STREAM"),
  zappiti: createTextButtonSVG("ZAPPITI"),
  apple_tv: createTextButtonSVG("APPLE TV"),
  dvdo: createTextButtonSVG("DVDO"),
  input_video: createTextButtonSVG("COMPOSITE"),
  input_s_vhs: createTextButtonSVG("S-VHS"),
  // Add more mappings as needed
}; 
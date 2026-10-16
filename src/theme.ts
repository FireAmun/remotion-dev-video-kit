import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

// Example brand (Amar Elshaer Dev, amarhassan.com) - replace with yours. Components read
// colours and fonts from here only — never hard-code them.

const poppins = loadPoppins("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const mono = loadJetBrainsMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const theme = {
  colors: {
    background: "#0B0B0C",
    surface: "#1A1A1D", // slightly lifted from background, for cards and the character disc
    gold: "#D4AF37",
    goldLight: "#E8CC6E",
    goldDark: "#B8912A",
    text: "#F2EDE0",
    muted: "#9A9488",
  },
  fonts: {
    heading: poppins.fontFamily,
    body: inter.fontFamily,
    mono: mono.fontFamily,
  },
  /** The rigged character's own palette (skin matches the Canva head art). */
  character: {
    skin: "#F4A86C",
    skinLight: "#FAB77E",
    skinShade: "#DA8E57",
    outline: "#1A1311",
    hoodieLight: "#303036",
    hoodie: "#1C1C20",
    hoodieShade: "#111113",
    pantsLight: "#3A3A41",
    pants: "#2A2A30",
    pantsShade: "#1C1C21",
    shoe: "#F4F2EE",
    shoeShade: "#C9C6BF",
  },
  /** Scene sets (stage, code room, ...): dark, warm, gold-lit. */
  set: {
    wall: "#121214",
    wallLight: "#1B1A17",
    floor: "#17130D",
    floorLine: "#2A2216",
    curtain: "#1F1A12",
    curtainShade: "#130F0A",
    wood: "#4A3420",
    woodDark: "#2A2014",
    deskTop: "#3A2C1A",
    board: "#16201B",
    nightSky: "#0A0D18",
    building: "#0E0E12",
    device: "#2A2A2E",
    screen: "#0D0D10",
    hillNear: "#0E120C",
    hillFar: "#141A12",
    books: ["#3A2C1A", "#2A2216", "#4A3420", "#1F1A12", "#5A4526", "#30261A"],
    skyNight: ["#0A0C1C", "#1A161E"],
    skyDay: ["#6078A0", "#D6AA6E"],
    deviceLight: "#303035",
    deviceEdge: "#3A3A40",
    shine: "#FFFFFF",
    blueprint: "#0A1322",
    blueprintDeep: "#060B15",
  },
  /** Change these to your own brand. */
  brand: {
    name: "Amar Elshaer Dev",
    handle: "@amar_elshaer_dev",
    website: "amarhassan.com",
  },
} as const;

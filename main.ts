// news-image-20261126 — "The World", Thursday 26 November 2026.
// A one-page newspaper front page: the US tariff proposal, Ukraine's
// Savasleyka strike, and the Gulf oil scare, plus six briefs from Cairo
// to London. The picture is entry.png next to this file; the program
// checks it is a real PNG inside the gate's size limits and copies it to
// /output/entry.png (Node 22, standard library only).
//
// Outside the grader's container:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const GATE_MAX_SIDE = 1024;
const GATE_MAX_BYTES = 1_048_576;

type Story = {
  role: "lead" | "second" | "third" | "brief";
  headline: string;
  place: string;
  line: string;
};

const STORIES: Story[] = [
  {
    role: "lead",
    headline: "US proposes new tariffs on 14 partners",
    place: "Washington",
    line: "China faces the highest rates after an eight-month Section 301 probe",
  },
  {
    role: "second",
    headline: "Ukraine hits Russian air base",
    place: "Savasleyka",
    line: "Five planes damaged, three MiG-31s and two Su-34s, and two refineries struck",
  },
  {
    role: "third",
    headline: "Oil jumps as Gulf tensions flare",
    place: "Strait of Hormuz",
    line: "Houthis claim a Saudi refinery hit; Brent $94.71 as mines strike ships",
  },
  {
    role: "brief",
    headline: "Fuel tanker fire kills at least 31",
    place: "Cairo",
    line: "Tanker overturns on the Ring Road in Warraq; 21 injured",
  },
  {
    role: "brief",
    headline: "100th Macy's parade moved to Saturday",
    place: "New York",
    line: "First weather postponement in its history; a nor'easter brings high winds",
  },
  {
    role: "brief",
    headline: "South Korea lifts rates to 3.25%",
    place: "Seoul",
    line: "Central bank resumes tightening on an AI-fuelled export boom",
  },
  {
    role: "brief",
    headline: "Ukraine peace talks end with no deal",
    place: "Abu Dhabi",
    line: "Russia insists on its territorial claims; strikes hit the energy grid",
  },
  {
    role: "brief",
    headline: "US stocks slide as AI sell-off deepens",
    place: "Markets",
    line: "S&P 500 and Dow Jones fall into correction territory",
  },
  {
    role: "brief",
    headline: "Duran Duran guitarist Andy Taylor dies at 65",
    place: "London",
    line: "Death announced Wednesday; he died Monday of prostate cancer",
  },
];

function readPngSize(bytes: Buffer): { width: number; height: number } {
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) {
      throw new Error("entry.png is not a PNG file");
    }
  }
  if (bytes.subarray(12, 16).toString("latin1") !== "IHDR") {
    throw new Error("entry.png has no IHDR chunk");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function checkRoles(): void {
  for (const role of ["lead", "second", "third"] as const) {
    const found = STORIES.filter((story) => story.role === role).length;
    if (found !== 1) {
      throw new Error(`front page needs exactly one ${role} story, found ${found}`);
    }
  }
  const briefs = STORIES.filter((story) => story.role === "brief").length;
  if (briefs !== 6) {
    throw new Error(`front page needs exactly six briefs, found ${briefs}`);
  }
}

function main(): void {
  checkRoles();
  const src = fileURLToPath(new URL("./entry.png", import.meta.url));
  const bytes = readFileSync(src);
  const { width, height } = readPngSize(bytes);
  if (width > GATE_MAX_SIDE || height > GATE_MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
  }
  if (bytes.length > GATE_MAX_BYTES) {
    throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const dest = join(outDir, "entry.png");
  copyFileSync(src, dest);
  console.log("THE WORLD — Thursday 26 November 2026 — one day, one page");
  for (const story of STORIES) {
    console.log(`[${story.role}] ${story.headline} — ${story.place}: ${story.line}`);
  }
  console.log(`Wrote ${dest} (${bytes.length} bytes, ${width}x${height})`);
}

main();

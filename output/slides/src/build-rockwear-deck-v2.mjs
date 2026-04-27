import path from "node:path";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  layers,
  panel,
  text,
  image,
  shape,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from "/Users/maxwell/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const require = createRequire(import.meta.url);
const { Canvas, loadImage } = require("/Users/maxwell/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/node_modules/skia-canvas");

const root = "/Users/maxwell/Downloads/Unleashed";
const outDir = path.join(root, "output/slides/v2");
const assetDir = path.join(root, "output/slides/assets");
const previewDir = path.join(outDir, "previews");
const pptxPath = path.join(outDir, "rockwear-swp391-intro-v2.pptx");
const montagePath = path.join(outDir, "rockwear-swp391-v2-montage.png");

const W = 1920;
const H = 1080;

const logo = path.join(root, "unleashed-frontend/src/assets/images/superlogo.png");
const shopShot = path.join(assetDir, "rockwear-shop-1440.png");
const loginShot = path.join(assetDir, "rockwear-login-1440.png");
const cleanCover = path.join(outDir, "assets/cover-clean-crop.png");

const C = {
  black: "#050505",
  black2: "#090909",
  panel: "#101010",
  line: "#2A2A2A",
  white: "#FFFFFF",
  soft: "#CFCFCF",
  muted: "#8F8F8F",
  red: "#FF3F42",
  red2: "#D71920",
  redDark: "#8A0E12",
  blue: "#177CD8",
};

async function ensureCoverAsset() {
  await fs.mkdir(path.dirname(cleanCover), { recursive: true });
  const img = await loadImage(shopShot);
  const canvas = new Canvas(1600, 1080);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 650, 86, 690, 760, 0, 0, 1600, 1080);
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.fillRect(0, 0, 1600, 1080);
  ctx.fillStyle = "rgba(215,25,32,0.12)";
  ctx.fillRect(1030, 0, 570, 1080);
  await canvas.toFile(cleanCover);
}

async function asDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const bytes = await fs.readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

await ensureCoverAsset();

const logoData = await asDataUrl(logo);
const coverData = await asDataUrl(cleanCover);
const shopData = await asDataUrl(shopShot);
const loginData = await asDataUrl(loginShot);

function txt(value, size, opts = {}) {
  return text(value, {
    name: opts.name,
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    style: {
      fontFamily: opts.fontFamily ?? "Poppins",
      fontSize: size,
      bold: opts.bold ?? false,
      italic: opts.italic ?? false,
      color: opts.color ?? C.white,
      lineSpacingMultiple: opts.lineSpacingMultiple ?? 0.98,
    },
  });
}

function label(value, opts = {}) {
  return txt(value, opts.size ?? 18, {
    width: opts.width ?? fill,
    color: opts.color ?? C.red,
    bold: true,
    fontFamily: "Montserrat",
    lineSpacingMultiple: 1,
  });
}

function body(value, opts = {}) {
  return txt(value, opts.size ?? 25, {
    width: opts.width ?? fill,
    color: opts.color ?? C.soft,
    bold: opts.bold ?? false,
    lineSpacingMultiple: opts.lineSpacingMultiple ?? 1.12,
  });
}

function darkPanel(child, opts = {}) {
  return panel(
    {
      width: opts.width ?? fill,
      height: opts.height ?? hug,
      padding: opts.padding ?? { x: 30, y: 26 },
      fill: opts.fill ?? C.panel,
      line: opts.line ?? { fill: C.line, width: 1 },
      borderRadius: "rounded-lg",
      columnSpan: opts.columnSpan,
      rowSpan: opts.rowSpan,
    },
    child,
  );
}

function slideRoot(children, opts = {}) {
  return layers({ width: fill, height: fill }, [
    shape({ width: fill, height: fill, fill: opts.fill ?? C.black }),
    ...(opts.bg ?? []),
    column({ width: fill, height: fill, padding: opts.padding ?? { x: 104, y: 80 }, gap: opts.gap ?? 32 }, children),
  ]);
}

function addSlide(deck, node) {
  const slide = deck.slides.add();
  slide.compose(node, { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 });
  return slide;
}

function titleStack(kicker, title, subtitle, width = fill) {
  return column({ width, height: hug, gap: 16 }, [
    label(kicker),
    txt(title, 66, { width, bold: true, lineSpacingMultiple: 0.9 }),
    subtitle ? body(subtitle, { width: wrap(1120), size: 27 }) : undefined,
  ].filter(Boolean));
}

function bullet(title, detail, opts = {}) {
  return row({ width: fill, height: hug, gap: 18, align: "start" }, [
    txt("■", 18, { width: fixed(24), color: opts.color ?? C.red }),
    column({ width: fill, height: hug, gap: 5 }, [
      txt(title, opts.titleSize ?? 26, { bold: true, color: opts.titleColor ?? C.white }),
      detail ? body(detail, { size: opts.detailSize ?? 20, color: opts.detailColor ?? C.soft, lineSpacingMultiple: 1.1 }) : undefined,
    ].filter(Boolean)),
  ]);
}

function talkTrack(items) {
  return column({ width: fill, height: hug, gap: 20 }, items.map((item) => bullet(item[0], item[1], { detailSize: 19 })));
}

function diagramPlaceholder(title, subtitle) {
  return panel(
    {
      width: fill,
      height: fill,
      padding: { x: 42, y: 36 },
      fill: "#080808",
      line: { fill: C.red2, width: 2 },
      borderRadius: "rounded-lg",
    },
    column({ width: fill, height: fill, justify: "center", gap: 18 }, [
      txt(title, 46, { bold: true }),
      body(subtitle, { size: 24, width: wrap(760) }),
      rule({ width: fixed(260), stroke: C.red, weight: 4 }),
      body("Drop the diagram image here before presenting.", { size: 21, color: C.muted }),
    ]),
  );
}

function uiFrame(dataUrl, alt) {
  return panel(
    {
      width: fill,
      height: fill,
      padding: 0,
      fill: C.black2,
      line: { fill: C.line, width: 1 },
      borderRadius: "rounded-lg",
    },
    image({ dataUrl, width: fill, height: fill, fit: "contain", alt }),
  );
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

// 1. Cover: no text over the original website copy.
addSlide(
  deck,
  layers({ width: fill, height: fill }, [
    shape({ width: fill, height: fill, fill: C.black }),
    row({ width: fill, height: fill }, [
      column({ width: fixed(980), height: fill, padding: { x: 104, y: 76 }, gap: 34 }, [
        image({ dataUrl: logoData, width: fixed(210), height: fixed(110), fit: "contain", alt: "ROCKWEAR logo" }),
        column({ width: fill, height: grow(1), justify: "center", gap: 22 }, [
          label("SWP391 PROJECT INTRODUCTION", { size: 18 }),
          txt("ROCKWEAR", 122, { bold: true, lineSpacingMultiple: 0.82 }),
          txt("Clothing Shop Website", 54, { bold: true, color: C.red }),
          body("A streetwear e-commerce platform for shopping, order processing, stock control, and promotion operations.", {
            size: 29,
            width: wrap(760),
          }),
        ]),
        darkPanel(
          column({ width: fill, height: hug, gap: 12 }, [
            label("PRESENTED BY", { size: 15 }),
            body("Nguyễn Gia Bảo (Leader)\nNguyễn Phúc An\nPhạm Trí Trọng Ân\nNguyễn Phúc An", {
              size: 19,
              color: C.white,
              lineSpacingMultiple: 1.13,
            }),
            body("Lecturer: Quách Luyl Đa", { size: 19, color: C.soft }),
          ]),
          { width: fill, height: hug, padding: { x: 24, y: 20 }, fill: "#0E0E0E" },
        ),
      ]),
      layers({ width: grow(1), height: fill }, [
        image({ dataUrl: coverData, width: fill, height: fill, fit: "cover", alt: "Clean ROCKWEAR mood crop" }),
        shape({ width: fixed(18), height: fill, fill: C.red2 }),
      ]),
    ]),
  ]),
);

// 2. Project and team speaking map.
addSlide(
  deck,
  slideRoot([
    titleStack(
      "PROJECT POSITIONING",
      "What we built, and how to present it",
      "Use this slide to introduce the project clearly before jumping into diagrams.",
    ),
    grid(
      { width: fill, height: grow(1), columns: [fr(1.08), fr(0.92)], columnGap: 56, alignItems: "stretch" },
      [
        column({ width: fill, height: fill, justify: "center", gap: 28 }, [
          bullet("Problem", "Streetwear shopping needs a fast storefront, reliable stock visibility, and clear order tracking."),
          bullet("Solution", "ROCKWEAR connects customer shopping flows with staff/admin operational workflows."),
          bullet("Scope", "Storefront, authentication, cart, checkout, orders, vouchers, promotions, stock, reviews, notifications, and statistics."),
        ]),
        darkPanel(
          column({ width: fill, height: fill, gap: 22 }, [
            label("TEAM TALKING MAP", { size: 16 }),
            bullet("Nguyễn Gia Bảo", "Leader · project overview and closing", { detailSize: 19 }),
            bullet("Nguyễn Phúc An", "Customer flow and UI demo", { detailSize: 19 }),
            bullet("Phạm Trí Trọng Ân", "Architecture, data model, and backend logic", { detailSize: 19 }),
            bullet("Nguyễn Phúc An", "Dashboard operations and QA points", { detailSize: 19 }),
          ]),
          { height: fill, padding: { x: 34, y: 32 }, fill: "#0D0D0D" },
        ),
      ],
    ),
  ]),
);

// 3. Early diagram slot: use-case scope.
addSlide(
  deck,
  slideRoot([
    titleStack("DIAGRAM 1", "System actors and use-case scope", "Place the main use-case diagram here so the audience understands the system boundary before seeing implementation details."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1.38), fr(0.62)], columnGap: 42, alignItems: "stretch" },
      [
        diagramPlaceholder("Paste Use-Case Diagram", "Recommended: Guest / Customer / Staff / Admin use-case diagram from RDS."),
        darkPanel(
          column({ width: fill, height: fill, justify: "center", gap: 26 }, [
            label("WHAT TO SAY", { size: 16 }),
            ...talkTrack([
              ["Guest", "Can browse, search, register, and login."],
              ["Customer", "Can wishlist, cart, checkout, review, and track orders."],
              ["Staff/Admin", "Manage products, orders, stock, campaigns, accounts, and statistics."],
              ["RBAC", "Each role only reaches its authorized screens and APIs."],
            ]).children,
          ]),
          { height: fill, padding: { x: 32, y: 34 } },
        ),
      ],
    ),
  ]),
);

// 4. Customer flow with real UI.
addSlide(
  deck,
  slideRoot([
    titleStack("CUSTOMER EXPERIENCE", "A simple path from discovery to order", "The customer side is designed as a familiar e-commerce journey, but backed by stock checks, vouchers, and order history."),
    grid(
      { width: fill, height: grow(1), columns: [fr(0.72), fr(1.28)], columnGap: 46, alignItems: "stretch" },
      [
        column({ width: fill, height: fill, justify: "center", gap: 24 }, [
          bullet("Browse", "Shop, search, and inspect product details."),
          bullet("Choose", "Pick variation, quantity, cart, or wishlist."),
          bullet("Checkout", "Apply voucher and choose payment method."),
          bullet("Track", "Follow order status and review after purchase."),
        ]),
        grid(
          { width: fill, height: fill, columns: [fr(1), fr(1)], rows: [fr(1)], columnGap: 22, alignItems: "stretch" },
          [
            uiFrame(shopData, "ROCKWEAR shop UI"),
            uiFrame(loginData, "ROCKWEAR login UI"),
          ],
        ),
      ],
    ),
  ]),
);

// 5. Early technical diagram slot.
addSlide(
  deck,
  slideRoot([
    titleStack("DIAGRAM 2", "Architecture, ERD, or class diagram", "Use this slot for the technical diagram that best supports your demo route."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1.35), fr(0.65)], columnGap: 42, alignItems: "stretch" },
      [
        diagramPlaceholder("Paste Technical Diagram", "Recommended: ERD, login sequence, order class diagram, or stock import class diagram."),
        darkPanel(
          column({ width: fill, height: fill, justify: "center", gap: 24 }, [
            label("BEST PICKS", { size: 16 }),
            bullet("ERD", "Use if you want to prove database completeness.", { detailSize: 19 }),
            bullet("Sequence", "Use if you want to explain request flow.", { detailSize: 19 }),
            bullet("Class diagram", "Use if you want to connect controllers, services, and repositories.", { detailSize: 19 }),
            body("Delete one diagram slide if the presentation needs to be even shorter.", { size: 20, color: C.muted }),
          ]),
          { height: fill, padding: { x: 32, y: 34 } },
        ),
      ],
    ),
  ]),
);

// 6. Architecture and data story.
addSlide(
  deck,
  slideRoot([
    titleStack("SYSTEM DESIGN", "React UI → REST API → Services → Repositories → Database", "The implementation follows a layered structure so business rules stay separate from UI and persistence."),
    column({ width: fill, height: grow(1), justify: "center", gap: 46 }, [
      grid(
        { width: fill, height: fixed(260), columns: [fr(1), auto, fr(1), auto, fr(1), auto, fr(1)], columnGap: 24, alignItems: "center" },
        [
          darkPanel(column({ width: fill, gap: 12 }, [label("FRONTEND"), txt("React WebPages", 34, { bold: true }), body("Routes, forms, shop UI, dashboard UI", { size: 20 })]), { height: fill }),
          txt("→", 42, { width: fixed(42), color: C.red }),
          darkPanel(column({ width: fill, gap: 12 }, [label("API"), txt("REST Controllers", 34, { bold: true }), body("Request handling and authorization", { size: 20 })]), { height: fill }),
          txt("→", 42, { width: fixed(42), color: C.red }),
          darkPanel(column({ width: fill, gap: 12 }, [label("LOGIC"), txt("Services + DTOs", 34, { bold: true }), body("Business rules and workflow orchestration", { size: 20 })]), { height: fill }),
          txt("→", 42, { width: fixed(42), color: C.red }),
          darkPanel(column({ width: fill, gap: 12 }, [label("DATA"), txt("Repositories + DB", 34, { bold: true }), body("Persistent product, order, stock, user data", { size: 20 })]), { height: fill }),
        ],
      ),
      row({ width: fill, height: hug, gap: 72, align: "center", justify: "center" }, [
        column({ width: fixed(250), gap: 8 }, [txt("36", 80, { bold: true, color: C.red }), body("database tables", { size: 23 })]),
        column({ width: fixed(250), gap: 8 }, [txt("79", 80, { bold: true }), body("business rules", { size: 23 })]),
        column({ width: fixed(250), gap: 8 }, [txt("86", 80, { bold: true, color: C.red }), body("SDS code designs", { size: 23 })]),
      ]),
    ]),
  ]),
);

// 7. Value and quality.
addSlide(
  deck,
  slideRoot([
    titleStack("WHAT MAKES IT COMPLETE", "Customer value plus operational control", "The project can be presented as more than a CRUD website because each feature connects to a real store workflow."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], columnGap: 28, alignItems: "stretch" },
      [
        darkPanel(column({ width: fill, height: fill, gap: 22 }, [
          label("SHOPPING", { size: 16 }),
          txt("Browse, cart, checkout, review", 38, { bold: true }),
          body("A customer can move from discovery to purchase without leaving the product context.", { size: 22 }),
        ]), { height: fill }),
        darkPanel(column({ width: fill, height: fill, gap: 22 }, [
          label("OPERATIONS", { size: 16 }),
          txt("Orders, stock, suppliers, campaigns", 38, { bold: true }),
          body("Staff and admins can keep catalog data, stock flow, and promotions synchronized.", { size: 22 }),
        ]), { height: fill }),
        darkPanel(column({ width: fill, height: fill, gap: 22 }, [
          label("QUALITY", { size: 16 }),
          txt("Security, RBAC, validation, statistics", 38, { bold: true }),
          body("JWT, Google login, password safety, stock checks, voucher rules, and dashboard metrics support reliability.", { size: 22 }),
        ]), { height: fill }),
      ],
    ),
    panel(
      { width: fill, height: fixed(190), padding: { x: 34, y: 26 }, fill: "#080808", line: { fill: C.redDark, width: 1.4 }, borderRadius: "rounded-lg" },
      row({ width: fill, height: fill, gap: 30, align: "center" }, [
        column({ width: grow(1), height: hug, gap: 10 }, [
          label("RDS / SDS PROOF POINTS", { size: 16 }),
          body("Use these numbers as the bridge from feature list to demo: the project is documented, designed, and implementation-ready.", {
            size: 22,
            width: wrap(760),
          }),
        ]),
        row({ width: hug, height: hug, gap: 38, align: "center" }, [
          column({ width: fixed(170), gap: 6 }, [txt("27", 54, { bold: true, color: C.red }), body("use-case groups", { size: 18 })]),
          column({ width: fixed(170), gap: 6 }, [txt("36", 54, { bold: true }), body("database tables", { size: 18 })]),
          column({ width: fixed(170), gap: 6 }, [txt("79", 54, { bold: true, color: C.red }), body("business rules", { size: 18 })]),
          column({ width: fixed(170), gap: 6 }, [txt("86", 54, { bold: true }), body("code designs", { size: 18 })]),
        ]),
      ]),
    ),
  ]),
);

// 8. Final demo transition.
addSlide(
  deck,
  layers({ width: fill, height: fill }, [
    shape({ width: fill, height: fill, fill: C.black }),
    image({ dataUrl: coverData, width: fill, height: fill, fit: "cover", alt: "ROCKWEAR clean visual crop" }),
    shape({ width: fill, height: fill, fill: "rgba(0,0,0,0.72)" }),
    column({ width: fill, height: fill, padding: { x: 116, y: 82 }, gap: 30 }, [
      row({ width: fill, height: hug, justify: "between", align: "center" }, [
        image({ dataUrl: logoData, width: fixed(170), height: fixed(88), fit: "contain", alt: "ROCKWEAR logo" }),
        label("LIVE DEMO", { width: wrap(260), size: 20 }),
      ]),
      column({ width: fill, height: grow(1), justify: "center", gap: 30 }, [
        txt("Let’s demo\nROCKWEAR", 118, { bold: true, lineSpacingMultiple: 0.82 }),
        body("We will show the store, place the project in context, then connect the demo back to architecture and operations.", {
          size: 30,
          width: wrap(900),
        }),
        row({ width: hug, height: hug, gap: 20, align: "center" }, [
          darkPanel(txt("1. Storefront", 24, { bold: true }), { width: fixed(230), height: fixed(74), padding: { x: 24, y: 22 } }),
          darkPanel(txt("2. Customer Flow", 24, { bold: true }), { width: fixed(270), height: fixed(74), padding: { x: 24, y: 22 } }),
          darkPanel(txt("3. Dashboard", 24, { bold: true }), { width: fixed(230), height: fixed(74), padding: { x: 24, y: 22 } }),
        ]),
      ]),
    ]),
  ]),
);

async function saveBlob(blob, filePath) {
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function buildMontage(previewPaths) {
  const thumbW = 420;
  const thumbH = 236;
  const labelH = 34;
  const gap = 24;
  const cols = 4;
  const rowsNeeded = Math.ceil(previewPaths.length / cols);
  const canvas = new Canvas(cols * thumbW + (cols + 1) * gap, rowsNeeded * (thumbH + labelH) + (rowsNeeded + 1) * gap);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = C.black;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "18px Poppins";

  for (let i = 0; i < previewPaths.length; i += 1) {
    const img = await loadImage(previewPaths[i]);
    const col = i % cols;
    const rowIndex = Math.floor(i / cols);
    const x = gap + col * (thumbW + gap);
    const y = gap + rowIndex * (thumbH + labelH + gap);
    ctx.drawImage(img, x, y, thumbW, thumbH);
    ctx.fillStyle = C.red;
    ctx.fillText(`Slide ${i + 1}`, x, y + thumbH + 24);
  }

  await canvas.toFile(montagePath);
}

async function exportDeck() {
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(pptxPath);

  const previewPaths = [];
  for (let i = 0; i < deck.slides.count; i += 1) {
    const previewPath = path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    const png = await deck.slides.getItem(i).export({ format: "png" });
    await saveBlob(png, previewPath);
    previewPaths.push(previewPath);
  }

  await buildMontage(previewPaths);
  const summary = { pptxPath, montagePath, slideCount: deck.slides.count, previewPaths };
  await fs.writeFile(path.join(outDir, "build-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

await exportDeck();

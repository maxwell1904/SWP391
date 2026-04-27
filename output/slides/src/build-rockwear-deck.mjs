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
const outDir = path.join(root, "output/slides");
const assetDir = path.join(outDir, "assets");
const previewDir = path.join(outDir, "previews");
const pptxPath = path.join(outDir, "rockwear-swp391-intro.pptx");
const montagePath = path.join(outDir, "rockwear-swp391-preview-montage.png");

const W = 1920;
const H = 1080;

const A = (name) => path.join(assetDir, name);
const logo = path.join(root, "unleashed-frontend/src/assets/images/superlogo.png");
const shopShot = A("rockwear-shop-1440.png");
const loginShot = A("rockwear-login-1440.png");
const aboutShot = A("rockwear-about-1440.png");

async function asDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const bytes = await fs.readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

const logoData = await asDataUrl(logo);
const shopData = await asDataUrl(shopShot);
const loginData = await asDataUrl(loginShot);
const aboutData = await asDataUrl(aboutShot);

const C = {
  black: "#050505",
  black2: "#090909",
  panel: "#101010",
  panel2: "#151515",
  line: "#2A2A2A",
  white: "#FFFFFF",
  soft: "#C9C9C9",
  muted: "#8E8E8E",
  red: "#FF3F42",
  red2: "#D71920",
  redDark: "#8A0E12",
  blue: "#177CD8",
  yellow: "#EAB308",
};

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
      lineSpacingMultiple: opts.lineSpacingMultiple ?? 0.95,
    },
  });
}

function label(value, opts = {}) {
  return txt(value, opts.size ?? 18, {
    width: opts.width ?? fill,
    color: opts.color ?? C.red,
    bold: opts.bold ?? true,
    fontFamily: "Montserrat",
    lineSpacingMultiple: 1,
  });
}

function body(value, opts = {}) {
  return txt(value, opts.size ?? 28, {
    width: opts.width ?? fill,
    color: opts.color ?? C.soft,
    bold: opts.bold ?? false,
    lineSpacingMultiple: opts.lineSpacingMultiple ?? 1.12,
  });
}

function darkPanel(child, opts = {}) {
  return panel(
    {
      name: opts.name,
      width: opts.width ?? fill,
      height: opts.height ?? hug,
      padding: opts.padding ?? { x: 30, y: 26 },
      fill: opts.fill ?? C.panel,
      line: opts.line ?? { fill: C.line, width: 1 },
      borderRadius: opts.borderRadius ?? "rounded-lg",
      columnSpan: opts.columnSpan,
      rowSpan: opts.rowSpan,
    },
    child,
  );
}

function redButton(value) {
  return panel(
    {
      width: fixed(260),
      height: fixed(72),
      padding: { x: 28, y: 18 },
      fill: C.red2,
      line: { fill: C.red2, width: 0 },
      borderRadius: "rounded-lg",
    },
    txt(value, 22, { bold: true, color: C.white, fontFamily: "Montserrat" }),
  );
}

function slideRoot(children, opts = {}) {
  return layers({ width: fill, height: fill }, [
    shape({ width: fill, height: fill, fill: opts.fill ?? C.black }),
    ...(opts.bg ?? []),
    column({ width: fill, height: fill, padding: opts.padding ?? { x: 104, y: 82 }, gap: opts.gap ?? 34 }, children),
  ]);
}

function addSlide(presentation, node) {
  const slide = presentation.slides.add();
  slide.compose(node, { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 });
  return slide;
}

function titleStack(kicker, title, subtitle, width = fill) {
  return column({ width, height: hug, gap: 18 }, [
    label(kicker, { size: 18 }),
    txt(title, 64, { bold: true, width, lineSpacingMultiple: 0.92 }),
    subtitle ? body(subtitle, { size: 28, width: wrap(1120), lineSpacingMultiple: 1.12 }) : undefined,
  ].filter(Boolean));
}

function roleCard(title, subtitle, accent) {
  return darkPanel(
    column({ width: fill, height: fill, gap: 16 }, [
      txt(accent, 42, { bold: true, color: C.red }),
      txt(title, 32, { bold: true }),
      body(subtitle, { size: 22, lineSpacingMultiple: 1.15 }),
    ]),
    { height: fixed(310), padding: { x: 28, y: 28 } },
  );
}

function featureRow(title, detail) {
  return row({ width: fill, height: hug, gap: 22, align: "center" }, [
    txt("■", 20, { width: fixed(28), color: C.red }),
    column({ width: fill, height: hug, gap: 6 }, [
      txt(title, 26, { bold: true }),
      body(detail, { size: 20, lineSpacingMultiple: 1.12 }),
    ]),
  ]);
}

function metric(value, caption, color = C.white) {
  return column({ width: fill, height: hug, gap: 8 }, [
    txt(value, 82, { bold: true, color, lineSpacingMultiple: 0.9 }),
    body(caption, { size: 22, color: C.soft }),
  ]);
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

addSlide(
  deck,
  layers({ width: fill, height: fill }, [
    image({ dataUrl: shopData, width: fill, height: fill, fit: "cover", alt: "ROCKWEAR storefront UI" }),
    shape({ width: fill, height: fill, fill: "rgba(0,0,0,0.58)" }),
    column({ width: fill, height: fill, padding: { x: 108, y: 72 }, gap: 34 }, [
      row({ width: fill, height: hug, align: "center", justify: "between" }, [
        image({ dataUrl: logoData, width: fixed(170), height: fixed(90), fit: "contain", alt: "ROCKWEAR logo" }),
        label("SWP391 PROJECT INTRODUCTION", { width: wrap(620), size: 18 }),
      ]),
      column({ width: wrap(1180), height: grow(1), justify: "center", gap: 20 }, [
        label("ROCKWEAR CLOTHING SHOP WEBSITE", { size: 20 }),
        txt("UNLEASH\nYOUR REBEL", 112, { bold: true, lineSpacingMultiple: 0.78 }),
        body("A streetwear e-commerce platform built for curated shopping, order management, stock control, and campaign operations.", {
          size: 30,
          width: wrap(1040),
        }),
        row({ width: hug, height: hug, gap: 18, align: "center" }, [
          redButton("Project Pitch"),
          body("Can Tho, April 2026", { size: 22, width: wrap(360), color: C.soft }),
        ]),
      ]),
      body("Team: Nguyễn Gia Bảo (Leader) · Nguyễn Phúc An · Phạm Trí Trọng Ân · Nguyễn Phúc An\nLecturer: Quách Luyl Đa", {
        size: 19,
        width: fill,
        color: C.white,
        lineSpacingMultiple: 1.08,
      }),
    ]),
  ]),
);

addSlide(
  deck,
  slideRoot(
    [
      titleStack(
        "PROJECT SNAPSHOT",
        "A fashion shop that balances style and operations",
        "ROCKWEAR is not only a customer storefront. The system also gives staff and admins the tools to keep products, orders, campaigns, stock, and customer communication under control.",
      ),
      grid(
        {
          width: fill,
          height: grow(1),
          columns: [fr(0.95), fr(1.05)],
          columnGap: 60,
          alignItems: "center",
        },
        [
          column({ width: fill, height: hug, gap: 24 }, [
            featureRow("Customer-first shopping", "Browse products, search, wishlist, cart, checkout, order history, and reviews."),
            featureRow("Back-office workflows", "Manage catalog data, suppliers, warehouse stock, orders, vouchers, promotions, and notifications."),
            featureRow("Full-stack implementation", "React UI connects to REST APIs, service-layer business logic, repositories, and a relational database."),
          ]),
          panel(
            {
              width: fill,
              height: fixed(590),
              padding: 0,
              fill: C.black2,
              line: { fill: "#3A3A3A", width: 1 },
              borderRadius: "rounded-lg",
            },
            image({ dataUrl: loginData, width: fill, height: fill, fit: "cover", alt: "ROCKWEAR login UI" }),
          ),
        ],
      ),
    ],
    { bg: [shape({ width: fill, height: fixed(18), fill: C.red2 })] },
  ),
);

addSlide(
  deck,
  slideRoot([
    titleStack("USER ROLES", "Four actor groups, one connected shopping system", "The requirement document separates access and responsibilities so each role sees the workflow they actually need."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1), fr(1)], columnGap: 28, alignItems: "center" },
      [
        roleCard("Guest", "Explore shop, search products, register, and access public pages.", "01"),
        roleCard("Customer", "Build cart and wishlist, place orders, use vouchers, review purchased products.", "02"),
        roleCard("Staff", "Support operations: products, orders, stock, suppliers, reviews, and notifications.", "03"),
        roleCard("Admin", "Control accounts, permissions, product master data, campaigns, and statistics.", "04"),
      ],
    ),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("CUSTOMER JOURNEY", "From discovery to repeat purchase", "The core customer flow stays simple, while the system quietly handles availability, payment, discounts, notifications, and review eligibility."),
    column({ width: fill, height: grow(1), justify: "center", gap: 38 }, [
      row({ width: fill, height: hug, gap: 18, align: "center", justify: "center" }, [
        darkPanel(column({ width: fixed(190), height: hug, gap: 10 }, [txt("Browse", 30, { bold: true }), body("Shop, search, filter", { size: 18 })]), { width: fixed(220), height: fixed(150) }),
        txt("→", 44, { width: fixed(54), color: C.red }),
        darkPanel(column({ width: fixed(190), height: hug, gap: 10 }, [txt("Select", 30, { bold: true }), body("Size, color, quantity", { size: 18 })]), { width: fixed(220), height: fixed(150) }),
        txt("→", 44, { width: fixed(54), color: C.red }),
        darkPanel(column({ width: fixed(190), height: hug, gap: 10 }, [txt("Checkout", 30, { bold: true }), body("COD, VNPay, voucher", { size: 18 })]), { width: fixed(220), height: fixed(150) }),
        txt("→", 44, { width: fixed(54), color: C.red }),
        darkPanel(column({ width: fixed(190), height: hug, gap: 10 }, [txt("Track", 30, { bold: true }), body("History, status, detail", { size: 18 })]), { width: fixed(220), height: fixed(150) }),
        txt("→", 44, { width: fixed(54), color: C.red }),
        darkPanel(column({ width: fixed(190), height: hug, gap: 10 }, [txt("Review", 30, { bold: true }), body("Verified purchase only", { size: 18 })]), { width: fixed(220), height: fixed(150) }),
      ]),
      row({ width: fill, height: fixed(360), gap: 32 }, [
        panel({ width: grow(1), height: fill, padding: 0, fill: C.black2, line: { fill: C.line, width: 1 }, borderRadius: "rounded-lg" }, image({ dataUrl: shopData, width: fill, height: fill, fit: "cover", alt: "Shop UI" })),
        column({ width: fixed(520), height: fill, justify: "center", gap: 20 }, [
          label("WHAT THIS UNLOCKS", { size: 18 }),
          txt("A clean demo path for presentation day", 42, { bold: true, width: wrap(500) }),
          body("Start with the storefront, add a product to cart, apply a voucher, place an order, then show the dashboard side handling the order lifecycle.", { size: 24, width: wrap(500) }),
        ]),
      ]),
    ]),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("ADMIN & STAFF WORKSPACE", "Operations behind the storefront", "The dashboard turns the store into a managed business process instead of a static product catalog."),
    grid(
      {
        width: fill,
        height: grow(1),
        columns: [fr(1), fr(1), fr(1)],
        rows: [fr(1), fr(1)],
        columnGap: 26,
        rowGap: 26,
      },
      [
        darkPanel(column({ width: fill, gap: 10 }, [txt("Catalog", 32, { bold: true }), body("Products, categories, brands, variations", { size: 21 })]), { height: fill }),
        darkPanel(column({ width: fill, gap: 10 }, [txt("Orders", 32, { bold: true }), body("Approval, status updates, order detail", { size: 21 })]), { height: fill }),
        darkPanel(column({ width: fill, gap: 10 }, [txt("Stock", 32, { bold: true }), body("Warehouse view, import products, transaction history", { size: 21 })]), { height: fill }),
        darkPanel(column({ width: fill, gap: 10 }, [txt("Campaigns", 32, { bold: true }), body("Vouchers, promotions, product assignment", { size: 21 })]), { height: fill }),
        darkPanel(column({ width: fill, gap: 10 }, [txt("Community", 32, { bold: true }), body("Reviews, replies, customer notifications", { size: 21 })]), { height: fill }),
        darkPanel(column({ width: fill, gap: 10 }, [txt("Control", 32, { bold: true }), body("Accounts, role permissions, statistics", { size: 21 })]), { height: fill }),
      ],
    ),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("SYSTEM ARCHITECTURE", "A layered full-stack design", "The SDS organizes implementation around REST controllers, services, models/DTOs, repositories, security utilities, and configuration."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), auto, fr(1), auto, fr(1)], columnGap: 28, alignItems: "center" },
      [
        darkPanel(column({ width: fill, gap: 18 }, [
          label("FRONTEND", { size: 16 }),
          txt("React WebPages", 38, { bold: true }),
          body("Shopping UI, dashboard screens, routing, API client, form validation", { size: 22 }),
        ]), { height: fixed(360), padding: { x: 34, y: 34 } }),
        txt("→", 52, { width: fixed(64), color: C.red }),
        darkPanel(column({ width: fill, gap: 18 }, [
          label("BACKEND", { size: 16 }),
          txt("REST → Service", 38, { bold: true }),
          body("Controllers handle requests; services apply business rules and orchestrate workflows", { size: 22 }),
        ]), { height: fixed(360), padding: { x: 34, y: 34 } }),
        txt("→", 52, { width: fixed(64), color: C.red }),
        darkPanel(column({ width: fill, gap: 18 }, [
          label("DATA", { size: 16 }),
          txt("Repository → DB", 38, { bold: true }),
          body("Repositories persist users, products, orders, discounts, stock, reviews, notifications", { size: 22 }),
        ]), { height: fixed(360), padding: { x: 34, y: 34 } }),
      ],
    ),
    row({ width: fill, height: hug, gap: 22, align: "center" }, [
      label("SECURITY LAYER", { width: fixed(210), size: 16 }),
      body("JWT, Google login, password hashing, role-based authorization, account status checks, and email services.", { size: 23, width: fill }),
    ]),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("DATA BACKBONE", "The database mirrors real store operations", "The SDS table description lists 36 tables grouped around catalog, inventory, checkout, user management, campaigns, and engagement."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], rows: [auto, auto], columnGap: 28, rowGap: 28, alignItems: "stretch" },
      [
        darkPanel(column({ width: fill, gap: 12 }, [txt("User & Access", 30, { bold: true }), body("user, role, account profile, authentication state", { size: 20 })]), { height: fixed(210) }),
        darkPanel(column({ width: fill, gap: 12 }, [txt("Catalog", 30, { bold: true }), body("product, category, brand, size, color, variation", { size: 20 })]), { height: fixed(210) }),
        darkPanel(column({ width: fill, gap: 12 }, [txt("Inventory", 30, { bold: true }), body("stock, stock variation, provider, transactions", { size: 20 })]), { height: fixed(210) }),
        darkPanel(column({ width: fill, gap: 12 }, [txt("Checkout", 30, { bold: true }), body("orders, order status, payment, shipping, order items", { size: 20 })]), { height: fixed(210) }),
        darkPanel(column({ width: fill, gap: 12 }, [txt("Campaigns", 30, { bold: true }), body("discounts, vouchers, sale, promotion products", { size: 20 })]), { height: fixed(210) }),
        darkPanel(column({ width: fill, gap: 12 }, [txt("Engagement", 30, { bold: true }), body("reviews, comments, notifications, wishlist", { size: 20 })]), { height: fixed(210) }),
      ],
    ),
    body("Design goal: every customer-facing action has a corresponding operational record for tracking, validation, and reporting.", { size: 24, color: C.white }),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("SCOPE AT A GLANCE", "Requirements broad enough for a real store demo", "The presentation stays short, but the source documents define a much larger implementation surface."),
    row({ width: fill, height: grow(1), align: "center", gap: 54 }, [
      metric("4", "actor groups", C.red),
      metric("27", "RDS use-case groups", C.white),
      metric("36", "database tables", C.red),
      metric("79", "business rules", C.white),
      metric("86", "SDS code designs", C.red),
    ]),
    rule({ width: fill, stroke: C.line, weight: 2 }),
    body("This gives the project enough depth to demonstrate both user experience and software engineering: flows, rules, persistence, security, and reporting.", { size: 26, color: C.soft }),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("QUALITY DECISIONS", "Rules that protect the shopping experience", "The business rules focus on security, valid inventory, proper authorization, and trustworthy customer interactions."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1)], rows: [auto, auto, auto], columnGap: 42, rowGap: 24 },
      [
        featureRow("Role-based access control", "Guests, customers, staff, and admins only see the actions they are allowed to perform."),
        featureRow("Account and password safety", "Unique usernames/emails, password strength, hashing, session timeout, and reset-link expiration."),
        featureRow("Stock-aware checkout", "Products can only be ordered when available; quantity changes and cancellations update stock records."),
        featureRow("Promotion integrity", "Unique voucher codes, valid date ranges, usage limits, and admin/staff-managed campaigns."),
        featureRow("Verified reviews", "Customers can review only products from completed purchases, protecting review quality."),
        featureRow("Operational visibility", "Dashboards expose revenue, order status, best-selling products, and workflow history."),
      ],
    ),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("UI IDENTITY", "Streetwear energy, product-system clarity", "The current interface uses a dark canvas, red highlights, bold display type, and high-contrast product imagery."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], columnGap: 24, alignItems: "center" },
      [
        panel({ width: fill, height: fixed(430), padding: 0, fill: C.black2, line: { fill: C.line, width: 1 }, borderRadius: "rounded-lg" }, image({ dataUrl: shopData, width: fill, height: fill, fit: "contain", alt: "Shop hero" })),
        panel({ width: fill, height: fixed(430), padding: 0, fill: C.black2, line: { fill: C.line, width: 1 }, borderRadius: "rounded-lg" }, image({ dataUrl: loginData, width: fill, height: fill, fit: "contain", alt: "Login page" })),
        panel({ width: fill, height: fixed(430), padding: 0, fill: C.black2, line: { fill: C.line, width: 1 }, borderRadius: "rounded-lg" }, image({ dataUrl: aboutData, width: fill, height: fill, fit: "contain", alt: "About page" })),
      ],
    ),
    row({ width: fill, height: hug, justify: "between", align: "center" }, [
      body("Palette: black / white / ROCKWEAR red, with blue retained for legacy action states.", { size: 23, width: wrap(880) }),
      row({ width: hug, height: hug, gap: 14 }, [
        shape({ width: fixed(62), height: fixed(62), fill: C.black2, line: { fill: C.line, width: 1 } }),
        shape({ width: fixed(62), height: fixed(62), fill: C.red }),
        shape({ width: fixed(62), height: fixed(62), fill: C.white }),
        shape({ width: fixed(62), height: fixed(62), fill: C.blue }),
      ]),
    ]),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("LIVE DEMO SCRIPT", "A short story the audience can follow", "For a 5-minute class presentation, demo the project as one connected operational loop."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 50, alignItems: "center" },
      [
        column({ width: fill, height: hug, gap: 20 }, [
          featureRow("1. Open storefront", "Show the ROCKWEAR hero, product browsing, search/filter, and product detail."),
          featureRow("2. Act as customer", "Log in, add to wishlist/cart, apply voucher, choose payment, and place order."),
          featureRow("3. Switch to operation view", "Show order management, stock, product/catalog control, campaign management, and statistics."),
          featureRow("4. Close with architecture", "Explain how React, REST APIs, services, repositories, and database tables support the demo."),
        ]),
        darkPanel(
          column({ width: fill, height: fill, justify: "center", gap: 24 }, [
            label("PRESENTATION PROMISE", { size: 18 }),
            txt("Show the store.\nShow the system.\nShow the engineering.", 54, { bold: true, lineSpacingMultiple: 0.92 }),
            body("That sequence makes the project understandable to both non-technical viewers and software evaluators.", { size: 25, width: wrap(620) }),
          ]),
          { height: fixed(520), fill: "#0D0D0D", padding: { x: 48, y: 44 } },
        ),
      ],
    ),
  ]),
);

addSlide(
  deck,
  slideRoot([
    titleStack("OPTIONAL DIAGRAM SLOT", "Paste a detailed diagram here if the lecturer asks", "The short deck already contains a simplified architecture diagram. Use this slide only when you want to show an official SDS/RDS diagram."),
    grid(
      { width: fill, height: grow(1), columns: [fr(1), fr(1)], columnGap: 34, alignItems: "stretch" },
      [
        darkPanel(
          column({ width: fill, height: fill, justify: "center", gap: 18 }, [
            txt("Use Case or ERD", 42, { bold: true }),
            body("Suggested files: customer/admin/staff use-case diagram or database ERD from SDS/RDS.", { size: 24, width: wrap(650) }),
          ]),
          { height: fill, fill: "#0B0B0B", line: { fill: C.redDark, width: 2 }, padding: { x: 44, y: 44 } },
        ),
        darkPanel(
          column({ width: fill, height: fill, justify: "center", gap: 18 }, [
            txt("Sequence or Class Diagram", 42, { bold: true }),
            body("Suggested files: login sequence, order class diagram, product/catalog class diagram, or stock import class diagram.", { size: 24, width: wrap(650) }),
          ]),
          { height: fill, fill: "#0B0B0B", line: { fill: C.redDark, width: 2 }, padding: { x: 44, y: 44 } },
        ),
      ],
    ),
    body("Keep this slide as backup; delete it if the final presentation must stay very concise.", { size: 22, color: C.muted }),
  ]),
);

async function saveBlob(blob, filePath) {
  const bytes = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function exportDeck() {
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(pptxPath);

  const previewPaths = [];
  for (let i = 0; i < deck.slides.count; i += 1) {
    const slide = deck.slides.getItem(i);
    const previewPath = path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    const png = await slide.export({ format: "png" });
    await saveBlob(png, previewPath);
    previewPaths.push(previewPath);
  }

  await buildMontage(previewPaths);
  await fs.writeFile(
    path.join(outDir, "build-summary.json"),
    JSON.stringify({ pptxPath, montagePath, slideCount: deck.slides.count, previewPaths }, null, 2),
  );
  console.log(JSON.stringify({ pptxPath, montagePath, slideCount: deck.slides.count, previewPaths }, null, 2));
}

async function buildMontage(previewPaths) {
  const thumbW = 420;
  const thumbH = 236;
  const labelH = 34;
  const gap = 24;
  const cols = 3;
  const rowsNeeded = Math.ceil(previewPaths.length / cols);
  const canvas = new Canvas(cols * thumbW + (cols + 1) * gap, rowsNeeded * (thumbH + labelH) + (rowsNeeded + 1) * gap);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "18px Poppins";
  ctx.fillStyle = "#FFFFFF";

  for (let i = 0; i < previewPaths.length; i += 1) {
    const img = await loadImage(previewPaths[i]);
    const col = i % cols;
    const rowIndex = Math.floor(i / cols);
    const x = gap + col * (thumbW + gap);
    const y = gap + rowIndex * (thumbH + labelH + gap);
    ctx.drawImage(img, x, y, thumbW, thumbH);
    ctx.fillStyle = "#FF3F42";
    ctx.fillText(`Slide ${i + 1}`, x, y + thumbH + 24);
  }

  await canvas.saveAs(montagePath);
}

await exportDeck();

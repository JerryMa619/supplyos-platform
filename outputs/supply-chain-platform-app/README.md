# SupplyOS Platform App

This is the productized Web SaaS version of the SupplyOS prototype.

## What It Contains

- Next.js app structure
- React components for the supply chain workspace
- Mock connector, SKU, PO, supplier, and compliance datasets
- A desktop-friendly simulated sync check flow
- A canonical supply chain data model preview

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:3001`.

## Run As Desktop Software

Electron shell:

```bash
npm run desktop
```

This starts the Next.js app locally and opens it inside an Electron desktop
window named SupplyOS. The desktop shell lives in `desktop/main.cjs`.

Tauri shell:

```bash
npm run tauri:dev
```

Build a Tauri installer/app bundle:

```bash
npm run tauri:build
```

Build only the macOS `.app` bundle:

```bash
npm run tauri:build:app
```

## Product Direction

The platform should connect merchant systems such as Shopify, Amazon Seller,
ERP, accounting tools, 3PL providers, and read-only databases. Source data is
mapped into canonical objects: Product, Inventory, Sales Demand, Purchase Order,
Supplier, and Compliance File.

# SupplyOS

SupplyOS is an AI supply chain operations platform prototype for merchants.

It started as a static browser prototype and has been upgraded into a Next.js
Web SaaS app with desktop software shells.

## Current Deliverables

- `outputs/supply-chain-app`: original static HTML/CSS/JS prototype
- `outputs/supply-chain-platform-app`: productized Next.js app
- `outputs/supply-chain-platform-app/desktop`: Electron desktop shell
- `outputs/supply-chain-platform-app/src-tauri`: Tauri desktop shell

## Product Modules

- Merchant data onboarding
- Connector status for Shopify, Amazon Seller, ERP, databases, accounting, 3PL, and supplier portal
- Canonical supply chain data model
- Replenishment planning
- Purchase order tracking
- Supplier compliance document workflow
- Supplier risk scoring
- AI Copilot task generation

## Development Milestones

1. Built a static SupplyOS workspace prototype.
2. Added a data onboarding center for merchant-owned systems and databases.
3. Upgraded the prototype into a Next.js Web SaaS app.
4. Added a simulated sync-check flow.
5. Added an Electron shell for a desktop-app experience.
6. Added a Tauri shell after Rust was installed.
7. Built a macOS `.app` bundle successfully.

## Run The Web App

```bash
cd outputs/supply-chain-platform-app
npm install
npm run dev
```

Open `http://127.0.0.1:3001`.

## Build The Tauri macOS App

```bash
cd outputs/supply-chain-platform-app
npm run tauri:build:app
```

The generated app is:

```text
outputs/supply-chain-platform-app/src-tauri/target/release/bundle/macos/SupplyOS.app
```

## Notes

The full `.dmg` packaging step currently fails at the macOS DMG bundling stage,
but the `.app` bundle builds successfully.

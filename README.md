# Sharma Motors — garage owner app

Prototype for **DE319 Interaction Design Process & Methods** (IDC, IIT Bombay), Automobile Services project.
Team: Yatri Patel, Krishna Pathak, Manjusha N M, Arhan Kenavdekar.

> Revised brief: *Design an effective billing system for Indian local garage owners to help them generate bills, without hindering their existing workflow, or adding a logistical load, while also providing the customer with due bills.*

The screens come from the team's Figma Make prototype ("PHIG"). `src/App.tsx` is the Make source, and the design notes are in `docs/figma-make-plan.md`.

## Run it

```bash
npm install
npm run dev              # local dev server
npm run build:preview    # builds dist/preview.html, one self-contained file for the Claude artifact
```

## What's in the app

There are three bottom tabs: **Stock**, **Jobs** (the default, in the centre) and **My Garage**. Each tab is meant to fit on one screen, without long scrolling.

### Jobs
- **Scan plate** finds the job card for the vehicle in front of you. The scan is simulated, and you can also type the plate.
- Job cards are dark **bill cards** that you swipe sideways. Each one shows the stage, the plate, the vehicle, the ready-by time, the services and parts, and the estimate.
- The **grid button** switches to an overview of every job.
- **Add part or service** adds an item that stays greyed out ("Awaiting customer") until the customer approves it on WhatsApp. Approval is simulated after 5 seconds, and an approved part is taken out of Stock.
- Below the card: labour and tool charges, the customer, **Call**, **Notify (optional)**, the payment method (UPI or Cash), and **Mark as done**. Mark as done stays locked while anything is awaiting approval, and it logs the bill to My Garage.

### Stock
- A search bar, plus four tiles that also work as filters: Total parts, Running low, To order, and Stock value.
- Parts are grouped by type (Pistons, Brake pads…) with a total count. Tap a part to see the count for each brand.
- **Mark to order** adds the part to the Restock list in My Garage.

### My Garage
- A week strip that expands into the full month. Dots mark earning days and restock days, and tapping a day shows only that day.
- A profit card for the chosen day, week or month: money in, parts, wages and jobs.
- Bills and services, the Restock list (with an **Ordered** button), and the Team list with **Add mechanic**.

## Code structure

```
index.html            page shell
src/main.tsx          React entry
src/App.tsx           the whole app: state, tabs, sheets (from Figma Make)
src/index.css         Tailwind + Anek + base styles, frame breakpoint
scripts/inline.mjs    inlines the build into dist/preview.html
docs/                 Figma Make design notes
```

The stack is React 19, Vite and Tailwind 4.

**Visual design.** The layout and features are the Figma Make version. The look:
- **Colours** (from the team's reference image): near-black `#222222` for dark panels and text accents, orange `#ff4d0a` for primary buttons, active states and amounts, and peach `#ffd9c9` for low-stock highlights.
- **Neutrals:** a warm neutral `#f4f0ed` for cards and fills, warm greys `#4a4542` and `#6e6762` for secondary text.
- **Contrast:** buttons are orange with near-black text, which passes WCAG AA (4.8:1). White on orange doesn't (3.3:1).
- **Type:** Anek Latin everywhere. The garage name, plates and big amounts use it at its widest and heaviest (width 125, weight 800). Anek Devanagari matches it, for Hindi and Marathi later.
- **Elements:** pill buttons and segmented controls, filled cards and list rows, neutral icon circles, filled search pill, outlined inputs.

**Responsive:**
- Phones (any size, any orientation) get the app full screen, with tighter margins below 400px wide and room for the notch and home bar.
- Laptops and desktops get a phone frame that shrinks to fit the window height, so the bottom bar is never cut off.
- Landscape phones and short windows stay full screen, capped at 560px wide.

# Plan: Garage owner app (Stock / Jobs / My Garage)

_Copied from the Figma Make project "PHIG" (`plans/previous-conversation-attachments-these-agile-forest.md`)._

## Context
The current app is a customer-facing tracker (Home/Bookings/Messages/Profile). It becomes a garage owner/mechanic app with 3 bottom tabs: **Stock** (left), **Jobs** (center, default), **My Garage** (right). Figma node 2:16 is a service blueprint (not a screen); its "Garage owner - app" lane gives the workflow and vocabulary: scan plate -> ticket; inspect and edit item list; estimate = rate-card services + parts; assign mechanic and Start -> In work; add item (big part >= INR threshold needs WhatsApp approval Yes/No/Call, stock deducted on approval); Mark Done, record payment (cash/UPI) -> bill, stock deducted, transaction logged; monthly ledger of money in, parts, wages, profit. Currency is INR.

Design constraint from user: **avoid long scrolling screens**. Every tab fits one viewport with compact, segmented, or swipeable content.

## Approach (edit in place: `src/App.tsx`, `src/index.css`)
Keep the existing shell (430px frame, Manrope, #17211d / #d9ff5c, 8pt rhythm, toast, `Icon`). Replace the header greeting with garage name + date. Add icons: `box`, `garage`, `search`, `phone`, `scan`, `grid`, `list`. Shared mock state in `App` so Stock and Jobs stay in sync.

### Jobs tab
- Header toggle: **Stack** / **List** view.
- **Stack mode**: dominant dark job card (vehicle, plate, service, mechanic, status, progress, ready time, estimate in INR with line items count). Swipe/drag sideways (pointer events + prev/next buttons and dots) to shuffle through stacked cards, with peeking cards behind.
- **List mode**: compact vehicle cards; tapping one opens it as the detail card.
- Detail card, below the main card: secondary customer info (name, phone, vehicle, ticket #). Scrolling a bit reveals the end-of-job actions: **Mark as done** (records payment Cash/UPI), **Notify customer** (optional toggle/button), **Call customer**. Add item action; parts used deduct from Stock state; big part shows a pending WhatsApp-approval chip.
- Scan number plate CTA (compact, in header area) to create a new ticket.

### Stock tab
- Search bar at top (filters by part name/category/brand).
- Overview rows grouped by part type (Pistons, Brake pads, Filters, Oil, Batteries, Belts, Spark plugs, Bulbs...) with **total count** (e.g. Pistons 10) and brand count ("3 brands"); tapping expands inline to show per-brand counts (no deep scroll; list limited to a compact scroll area inside the card region with sticky search).
- Per-part "Mark to order" toggle; marked items flow into My Garage "To order" list. Low-stock indicator vs reorder level. Counts reduce when jobs consume parts (sync with Jobs).

### My Garage tab (segmented: Overview / Calendar / Team)
- **Overview**: profit card (money in, parts, wages -> profit for the month), earnings vs spend bar, "To order" list (items marked from Stock, with mark-ordered action), assets owned summary (tools, lift, stock value).
- **Calendar**: month grid (compact) with per-day dots for earnings/jobs/restock due; selecting a day shows income, jobs count, and planned restock; month summary strip for planning restocks and profit trend.
- **Team**: mechanics list (add/manage multiple mechanics: name, role, assigned job, wage, status); Add mechanic action; jobs assign to mechanics by name.

## Notes
- No new dependencies; no Figma assets needed. Reuse `notify`; keep 44px+ targets and focus-visible outlines.
- Use typed local state; segment state per tab. No router.
- Fit the viewport: use fixed header + internal content area sized to the frame, avoid page-long lists.

## Verification
- Preview: three tabs switch; stack swipe and list mode work; marking done/notify/call show toasts and update state; Stock search, expand, mark-to-order appears in My Garage; calendar day selection works; no overflow at 375px.
- Run `pnpm build` once for type errors.

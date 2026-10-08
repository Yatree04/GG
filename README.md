# Sharma Motors — garage owner app

Prototype for **DE319 Interaction Design Process & Methods** (IDC, IIT Bombay), Automobile Services project.
Team: Yatri Patel, Krishna Pathak, Manjusha N M, Arhan Kenavdekar.

> Revised brief: *Design an effective billing system for Indian local garage owners to help them generate bills, without hindering their existing workflow, or adding a logistical load, while also providing the customer with due bills.*

The screens come from the team’s Figma Make prototype ("PHIG"). Its notes are in `docs/figma-make-plan.md`. Since then the app has been split into files and its features connected, following the heuristic evaluation in `docs/heuristic-evaluation.md`.

## Run it

```bash
npm install
npm run dev              # local dev server
npm test                 # end-to-end checks (Playwright; run `npx playwright install chromium` once)
npm run build:preview    # builds dist/preview.html, one self-contained file for the Claude artifact
```

## What's in the app

Three bottom tabs: **Stock**, **Jobs** (default, centre) and **My Garage**. The bell (top right) lists everything waiting on the owner, and each row opens the place to act. Badges on the tabs show what needs attention there.

### Jobs
- **Scan plate** finds the vehicle's open job. A plate the garage hasn't seen offers a new job card. A returning vehicle has its customer details filled in.
- **Job cards** can be swiped, stepped through with the arrows, or picked from the dots. The **grid** button shows all jobs, including paid ones, which open their bill.
- Each card has the stage and a four-step progress bar, plus services, parts, labour, tool charges and the estimate or bill.
- The main button always names the next step: **Start inspection → Send estimate · start work → Mark ready · tell the customer → Close bill** (UPI, Cash or Pay later).
- **Add part or service**: pick an item (and the brand, for a part), then confirm. Before the estimate goes out, items are agreed face to face. Once work has started, parts of **₹1,000 or more** wait for the customer's OK ("They said yes / No"), and the job can't be marked ready until they answer.
- Below the card: the customer, **Call**, **Send update**, the **mechanic** (tap to reassign), the job's **WhatsApp & updates** log, and **past visits** for the vehicle.
- Toasts offer **Undo** for adding an item and closing a bill.

### Stock
- A search bar and three filters: All parts, Running low, To order.
- Tap a part to see the count for each brand, the buy and sell price, which open jobs use it, and **Add to order list** (later **Delivery came**).
- Stock goes down when a part is added to a job, or when the customer approves it, and goes back up if it's removed or undone.

### My Garage
- A week strip that expands into the month, with dots for earning days and restock days. Tap a day to see just that day.
- The profit card (money in, parts, wages, jobs) for the chosen range, plus **To collect** for unpaid bills.
- Three sections:
  - **Money**: dues (udhari) and paid bills, each opening the bill.
  - **Restock**: order list → Mark ordered → Delivery came, which adds stock and logs the spend. Low parts can be added from here.
  - **Team**: each mechanic, their current job (tap to open it), and Add mechanic.

## Code structure

```
src/model.ts          records (jobs, parts, bills, mechanics), seed data and rules
src/store.ts          useGarage(): all state and every action that changes it
src/ui.tsx            icons, colours, buttons, segmented control, bottom sheet
src/App.tsx           shell, bottom nav, notifications, bill sheet, toast with Undo
src/JobsTab.tsx       job cards, scan, add item, mechanic picker
src/StockTab.tsx      stock search, filters, parts
src/GarageTab.tsx     calendar, profit, money, restock, team
tests/garage.spec.ts  end-to-end flows across tabs
docs/                 Figma Make plan, heuristic evaluation
```

The stack is React 19, Vite and Tailwind 4. The colours are ink `#17211d` and lime `#d9ff5c`, on a warm grey background. Muted text is `#5c6660`, which passes WCAG AA.

See `docs/heuristic-evaluation.md` for the usability review behind these changes, and for the open questions.

# Ganga Garage — garage owner app prototype

Clickable prototype for **DE319 Interaction Design Process & Methods** (IDC, IIT Bombay), Automobile Services project.
Team: Yatri Patel, Krishna Pathak, Manjusha N M, Arhan Kenavdekar.

> Revised brief: *Design an effective billing system for Indian local garage owners to help them generate bills, without hindering their existing workflow, or adding a logistical load, while also providing the customer with due bills.*

**Core idea:** the bill is a byproduct. The owner tracks jobs the way he already works. The bill, stock and profit come out of that work automatically.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .        # or: python3 -m http.server
```

To make a single self-contained HTML file (used for the published Claude artifact):

```bash
python3 scripts/bundle.py   # writes dist/garage.html
```

## What's in the app

The bottom navigation has three tabs.

| Tab | What it does |
|---|---|
| **Tracking** | Job board with Waiting / In work / Ready tabs. Also shows WhatsApp tickets for customers who haven't arrived yet. The **Scan plate** button starts a job. |
| **Vehicles** | Every saved vehicle. Search it, or filter to *in garage now* or *due for service*. Each vehicle has a detail page with the owner, a "jo theek lage" (skip approvals) toggle, visits, total spent, next service, a history timeline, and buttons to start a job or send a reminder. |
| **Stock** | Parts counted in pieces and small parts counted in boxes, with restock alerts and today's stock movement. Tap any item to add stock or change its restock level. |

- **+ (top left)** is onboarding. It has three options:
  - add a new customer and vehicle in 3 steps (scan plate → details → WhatsApp welcome)
  - invite saved phone contacts with one message
  - the garage QR poster
- **Wallet icon (top right)** opens **Hisaab**: profit this month, worked out from bills, parts used, wages and expenses, plus a transaction history.
- **Settings:** the approval limit, the rate card, mechanics and language.

**What happens in a job:**
1. Scan the plate.
2. The customer's WhatsApp message and likely services are filled in.
3. Agree the work face to face, then send the estimate.
4. Pick the mechanic and the ready-by time, then start.
5. **Add item** for anything found during work. Parts above the limit stay greyed out until the customer replies.
6. **Mark done.** The bill is created and sent, and stock is deducted.
7. Record payment. It goes into Hisaab and the vehicle's history.

The **customer side is not designed yet**. The panel next to the phone stands in for it: it lists the WhatsApp messages the system sends, and lets you answer approval requests as the customer.

## Code structure

```
index.html        page shell (phone frame + demo panel)
css/tokens.css    design tokens — swap these to restyle everything
css/app.css       components (buttons, chips, lists, sheets, nav…)
js/data.js        sample data: rate card, parts, vehicles, stock, ledger
js/app.js         state, actions, views (plain JS, no framework)
scripts/bundle.py builds dist/garage.html (single file)
```

## Design system

The styling follows the **Wise Design System (2025)**:
- forest green and bright green
- Inter type
- pill buttons
- neutral tinted surfaces

The token values were matched by eye to Wise's published palette. To pull exact variables, duplicate the [Wise UI Kit](https://www.figma.com/design/yMgaysRErrfWWIlOcpqVzk/) into your drafts, then update `css/tokens.css`.

Garage-specific choices on top of Wise:
- 56px main actions, for greasy hands
- Indian number-plate chips
- bilingual labels are planned

## Still open (marked in the UI)

- Status + ETA instead of a queue number *(proposed)*
- Approval limit in ₹ *(proposed)* and per-customer "jo theek lage" *(considering)*
- Next-service date *(proposed)*
- Udhari (customer credit) *(open)*
- Language: English / हिंदी / मराठी *(open)*
- Onboarding flow *(open — being designed by the team)*

Sample names and numbers are illustrative, drawn from the team's field research in Nandurbar.

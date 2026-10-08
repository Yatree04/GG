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

To make single self-contained HTML files (used for the published Claude artifacts):

```bash
python3 scripts/bundle.py   # writes dist/garage.html (with demo panel) and dist/preview.html (app only)
```

`preview.html` is the garage app on its own, with no demo panel. Its bundle is published as the always-on preview artifact; republish `dist/preview.html` after each change.

## What's in the app

The bottom bar has three things only. Everything the owner looks at now and then sits behind the **JJ circle** (top right).

| Bottom bar | What it does |
|---|---|
| **Ongoing** | Vehicles in the garage today: Waiting / In work / Ready, plus WhatsApp tickets for customers who haven't arrived yet. A restock alert shows here when stock runs low. |
| **Scan** (big, centre) | Scan the number plate to link the job card to the vehicle standing in front of you. A known plate opens its job card, and a new plate starts onboarding. |
| **Vehicles** | Every saved vehicle. Search it, or filter to *in garage now* or *due for service*. Each vehicle has a detail page with the owner, a "jo theek lage" (skip approvals) toggle, visits, total spent, next service, history, and buttons to start a job or send a reminder. |

- **+ (top left)** is onboarding: new customer and vehicle in 3 steps, invite saved phone contacts, or the garage QR poster.
- **JJ circle (top right)** is the garage menu:
  - **Stock**: parts in pieces, small parts in boxes, restock alerts
  - **Hisaab**: monthly profit and transactions
  - **Settings**: approval limit, rate card, mechanics, language

**Job card** (follows the team's wireframe), top to bottom:
1. Vehicle name and plate.
2. **Billing**: the parts.
3. **+ Add more · notify**: adds a service or part and sends the customer the new total.
4. **Minimal tool charges** and **Labour charges**, then the total.
5. Four big tiles: the next step (Send estimate → Start work → Mark done → Record payment), Call, History, and who and when (or Remind to collect once it's ready).

**What happens in a job:**
1. Scan the plate.
2. The job card opens. The customer's WhatsApp message and likely services are filled in.
3. Agree the work face to face, then send the estimate.
4. Start work. The fourth tile changes the mechanic and the ready-by time.
5. **Add more** for anything found during work. Parts above the limit stay greyed out until the customer replies.
6. **Mark done.** The bill is created and sent, and stock is deducted.
7. Record payment. It goes into Hisaab and the vehicle's history.

The **customer side is not designed yet**. The panel next to the phone stands in for it: it lists the WhatsApp messages the system sends, and lets you answer approval requests as the customer.

## Code structure

```
index.html        page shell (phone frame + demo panel)
preview.html      page shell (garage app only)
css/tokens.css    design tokens — swap these to restyle everything
css/app.css       components (buttons, chips, lists, sheets, nav…)
js/data.js        sample data: rate card, parts, vehicles, stock, ledger
js/app.js         state, actions, views (plain JS, no framework)
scripts/bundle.py builds dist/garage.html and dist/preview.html (single files)
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

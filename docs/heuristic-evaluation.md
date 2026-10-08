# Heuristic evaluation — Sharma Motors garage owner app

**What was evaluated:** the Figma Make prototype "PHIG" (Stock / Jobs / My Garage), as it was before this round of changes.
**Method:** Nielsen's 10 usability heuristics, walked through the owner's main tasks: open a job from a plate, agree the work, add a part found during work, get approval, finish and take payment, restock, check the month.
**Severity:** 0 not a problem · 1 cosmetic · 2 minor · 3 major · 4 must fix before testing with owners.
**Evaluator:** one pass, by Claude. A heuristic evaluation needs 3–5 evaluators to catch most issues, so each team member should do their own pass and we merge the lists.

## 1. Information architecture after this round

Everything now reads from one set of records, so a change in one place shows up everywhere:

| Record | Connected to | How you get there |
|---|---|---|
| **Job** | customer, vehicle, mechanic, parts, bill, WhatsApp log | Jobs cards · All jobs grid · scan · notifications · Team · Stock part |
| **Part (stock)** | items on jobs, the order list, money spent on parts | Stock · "On open jobs" links back to the job · Restock in My Garage |
| **Bill** | job, customer, payment or due | closing a job · My Garage → Money · Past visits on a job · notifications |
| **Mechanic** | jobs | job card → Mechanic · My Garage → Team → "On job" link |
| **Notification** | pending approvals, ready vehicles, low stock, deliveries, dues | bell → each row opens the place to act |

Key flows that now connect:
- **Approve a part → stock goes down.** Remove it or tap Undo → it goes back on the shelf.
- **Close a bill → it appears in My Garage** (Money, profit card, calendar dot). "Pay later" → it shows under To collect, and collecting it adds to today's money.
- **Order list → delivery → stock count and parts spend** update together.
- **Scan a plate** → opens the open job, or offers a new job card. For a returning vehicle the customer details are filled in.

## 2. Findings and what was done

| # | Heuristic | Finding in the Make version | Sev. | Change |
|---|---|---|---|---|
| 1 | Visibility of system status | Approval resolved by itself after 5 s, with no sign of who replied or when. | 3 | Pending line shows "Awaiting Rohan's OK on WhatsApp" with **They said yes / No**. Every message and change goes into the job's **WhatsApp & updates** log. |
| 2 | Visibility of system status | The stage chip was a label only. There was no sense of what comes next. | 3 | Four-step progress bar on the card. The main button names the next step: Start inspection → Send estimate · start work → Mark ready · tell Rohan → Close bill. |
| 3 | Visibility of system status | The bell always showed a red dot and only gave a toast. | 2 | The dot shows only when something needs attention, with a count. The bell opens a list where each row links to the place to act. |
| 4 | Match with the real world | Labour and tool charges sat outside the bill in light grey, but they are on the customer's bill. | 2 | Moved inside the bill card. "Estimate" becomes "Bill" when the vehicle is ready. |
| 5 | Match with the real world | No way to bill now and get paid later, though udhari is common in local garages (field research). | 3 | **Pay later** creates a due bill, listed under To collect in My Garage and in notifications. |
| 6 | User control and freedom | No way to remove an item added by mistake. One tap in the add sheet sent a WhatsApp at once. | 4 | Items can be removed while agreeing the work, or while pending. The add sheet now needs a selection, then a confirm button that says what will happen. Toasts offer **Undo**. |
| 7 | User control and freedom | Marking a job done could not be reversed. | 3 | **Undo** on the close-bill toast puts the job back and removes the bill. |
| 8 | Consistency and standards | Every Stock tile had an arrow, but "Stock value" did nothing when tapped. | 2 | Tiles are now a filter group (All / Running low / To order). Stock value moved to plain text. |
| 9 | Consistency and standards | In Restock, "Ordered" removed the item, the same as "Remove from order list". | 2 | Clear steps: Add to list → Mark ordered → Delivery came (adds stock and logs the spend). |
| 10 | Error prevention | Payment defaulted to UPI, so a cash payment could be logged as UPI. | 3 | No default. "Close bill" stays disabled until a payment method is chosen. |
| 11 | Error prevention | Every added item needed approval, even a ₹320 filter, which adds friction and messages for no reason. | 2 | Only parts at or over **₹1,000** need approval once work has started. Before the estimate is sent, items are agreed face to face. The rule is shown in the add sheet. |
| 12 | Recognition rather than recall | The job card did not show the customer. The grid did not show who the job is for or who is on it. | 2 | Customer name on the card. The grid shows customer, mechanic and an "Awaiting OK" tag. |
| 13 | Recognition rather than recall | No vehicle history. | 2 | **Past visits** on the job, each opening the old bill. |
| 14 | Help users recover from errors | Scanning an unknown plate ended in "No job card found", a dead end. | 3 | An unknown plate offers a new job card form. A returning vehicle pre-fills the customer. |
| 15 | Flexibility and efficiency | Cards could only be changed by swiping, which is hard on desktop, with a keyboard or with greasy hands. | 2 | Previous / next buttons, and tappable dots. Fixed a bug found in testing where tapping a dot could land on the wrong job mid-scroll. |
| 16 | Flexibility and efficiency | Jobs and mechanics were not linked. A job could not be reassigned. | 2 | Mechanic picker on the job shows who is free. Team shows each mechanic's current job as a link. |
| 17 | Aesthetic and minimalist design | My Garage was one long scroll, against the team's own "avoid long scrolling" rule. | 2 | Calendar and profit stay on top. Below them a Money / Restock / Team switch shows one section at a time. |
| 18 | Accessibility (supports all 10) | Grey text (#8a948d) on the light background was 2.9:1 contrast, below the WCAG AA minimum of 4.5:1. Some labels were 9–10px. | 2 | Muted text darkened to #5c6660 (5.6:1 on the page, 5.0:1 on grey chips). Nav labels 12px. Status chips keep 10–11px; review with owners. |
| 19 | Help and documentation | The approval rule was never explained. | 1 | One line under Add part or service, and a warning in the add sheet when a part needs approval. |

## 3. Still open (for discussion)

- **Language.** English only. Owners in Nandurbar may prefer Hindi or Marathi labels. This is not done yet.
- **Approval limit.** It's fixed at ₹1,000. Should owners set it themselves, and should trusted regulars skip approval ("jo theek lage")?
- **Customer side.** The WhatsApp messages are logged but there's no screen for the customer yet.
- **Text size.** Status chips are 10–11px. Check legibility on owners' own phones, in daylight.
- **Small parts.** Nuts and bolts counted by the box (from the earlier prototype) aren't in this version.
- **Real testing.** This evaluation doesn't replace testing with 3–5 garage owners. Suggested tasks: (1) a car comes in and you scan it, (2) you find a worn brake pad during work, (3) the customer pays tomorrow, (4) you check whether you made a profit this week.

## 4. Automated checks

`npm test` runs `tests/garage.spec.ts` with Playwright on a phone-sized screen. Each test follows one flow across tabs:
1. Queue → inspection → estimate → part needing approval blocks "Mark ready" → approve → stock down → pay cash → bill in My Garage.
2. Undo puts a part back on the shelf.
3. Scanning an unknown plate opens a new job card.
4. Collecting a due bill adds to today's money.
5. Order list → ordered → delivery raises the stock count.
6. A notification opens Stock with "Running low" selected.
7. Team links to a mechanic's job, and reassigning updates the job.
8. Every control has an accessible name, and no tab scrolls sideways.

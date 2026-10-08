/* Data model for the garage owner app.
   Everything the tabs show comes from these records, so a change in one place
   (a part approved on a job, a bill closed, a delivery received) shows up everywhere. */

export type Stage = "Queued" | "Inspection" | "In work" | "Ready" | "Done";
export const STAGES: Stage[] = ["Queued", "Inspection", "In work", "Ready", "Done"];

export type ItemStatus = "ok" | "pending" | "declined";
export type Item = {
  id: string;
  label: string;
  kind: "service" | "part";
  price: number;
  status: ItemStatus;
  partId?: string;
  brand?: string;
  /** true once the part has been taken out of Stock */
  deducted?: boolean;
};

export type LogEntry = { time: string; text: string };

export type Job = {
  id: string;
  plate: string;
  vehicle: string;
  customer: string;
  phone: string;
  mechanic: string;
  stage: Stage;
  ready: string;
  labour: number;
  tool: number;
  items: Item[];
  /** WhatsApp messages and status changes, newest first */
  log: LogEntry[];
  billId?: string;
};

export type PayMethod = "UPI" | "Cash" | "Due";
export type Bill = {
  id: string;
  jobId?: string;
  plate: string;
  vehicle: string;
  customer: string;
  lines: { label: string; price: number }[];
  total: number;
  method: PayMethod;
  /** day of October the work was billed */
  day: number;
  /** day of October the money came in (unset while Due) */
  paidDay?: number;
};

export type Brand = { brand: string; qty: number };
export type Part = {
  id: string;
  name: string;
  reorder: number;
  price: number;
  cost: number;
  toOrder: boolean;
  ordered: boolean;
  brands: Brand[];
};

export type Mechanic = { id: string; name: string; role: string; wage: number };

export const TODAY = 8;
export const MONTH = "Oct";
/** Parts at or above this price need the customer's OK once work has started. */
export const APPROVAL_LIMIT = 1000;
export const PARTS_SPEND_BASE = 18400;
export const RESTOCK_DAYS = [10, 24];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const qty = (p: Part) => p.brands.reduce((s, b) => s + b.qty, 0);
export const isLow = (p: Part) => qty(p) <= p.reorder;
export const counted = (i: Item) => i.status === "ok";
export const jobTotal = (j: Job) => j.items.filter(counted).reduce((s, i) => s + i.price, 0) + j.labour + j.tool;
export const shortVehicle = (v: string) => v.split(" · ")[0];
export const firstName = (n: string) => n.split(" ")[0];
/** "Batteries" → "Battery", "Brake pads" → "Brake pad", "Engine oil (5L)" → "Engine oil 5L" */
export const singular = (name: string) => name.replace(/ \((.+)\)$/, " $1").replace(/ies$/, "y").replace(/([^s])s$/, "$1");
export const normPlate = (v: string) => v.replace(/[^a-z0-9]/gi, "").toUpperCase();
export const nextStage = (s: Stage): Stage => STAGES[Math.min(STAGES.indexOf(s) + 1, STAGES.length - 1)];
/** Before the estimate is sent the work is agreed face to face, so nothing needs approval. */
export const isAgreeing = (j: Job) => j.stage === "Queued" || j.stage === "Inspection";

const part = (id: string, name: string, reorder: number, price: number, brands: [string, number][]): Part => ({
  id, name, reorder, price, cost: Math.round(price * 0.72), toOrder: false, ordered: false,
  brands: brands.map(([brand, q]) => ({ brand, qty: q })),
});

export const seedParts = (): Part[] => [
  part("piston", "Pistons", 6, 1850, [["Bosch", 5], ["Mahle", 3], ["Hepu", 2]]),
  part("pads", "Brake pads", 8, 1450, [["Brembo", 4], ["Bosch", 3]]),
  part("oilf", "Oil filters", 10, 320, [["Mann", 9], ["Fram", 7], ["Purolator", 6]]),
  part("plugs", "Spark plugs", 12, 410, [["NGK", 10], ["Denso", 8]]),
  part("batt", "Batteries", 4, 6200, [["Exide", 2], ["Amaron", 1]]),
  part("belt", "Timing belts", 4, 2300, [["Gates", 4], ["Contitech", 2]]),
  part("oil", "Engine oil (5L)", 8, 2150, [["Castrol", 7], ["Mobil", 6]]),
  part("bulb", "Headlight bulbs", 10, 380, [["Philips", 12], ["Osram", 9]]),
  part("clutch", "Clutch plates", 3, 4800, [["Valeo", 2]]),
];

export const SERVICES: { label: string; price: number }[] = [
  { label: "Full service + oil change", price: 1800 },
  { label: "Brake inspection", price: 400 },
  { label: "Wheel alignment", price: 800 },
  { label: "AC gas top-up", price: 1500 },
  { label: "Battery terminal clean", price: 250 },
];

let n = 0;
export const uid = (p: string) => `${p}${Date.now().toString(36)}${(n++).toString(36)}`;

const it = (label: string, kind: Item["kind"], price: number, extra: Partial<Item> = {}): Item => ({
  id: uid("i"), label, kind, price, status: "ok", deducted: kind === "part", ...extra,
});

export const seedJobs = (): Job[] => [
  {
    id: "j1", plate: "MH 12 QR 4821", vehicle: "Hyundai i20 · 2019", customer: "Rohan Deshmukh", phone: "+91 98220 41877",
    mechanic: "Ajay", stage: "In work", ready: "5:00 PM", labour: 900, tool: 150,
    items: [
      it("Full service + oil change", "service", 1800),
      it("Oil filter · Mann", "part", 320, { partId: "oilf", brand: "Mann" }),
      it("Engine oil 5L · Castrol", "part", 2150, { partId: "oil", brand: "Castrol" }),
    ],
    log: [
      { time: "2:40 PM", text: "Work started by Ajay. Ready by 5:00 PM" },
      { time: "2:31 PM", text: "Estimate ₹5,320 sent on WhatsApp" },
    ],
  },
  {
    id: "j2", plate: "MH 14 DK 0937", vehicle: "Maruti Swift · 2016", customer: "Priya Nair", phone: "+91 97650 22314",
    mechanic: "Imran", stage: "Inspection", ready: "6:30 PM", labour: 1200, tool: 200,
    items: [
      it("Brake inspection", "service", 400),
      it("Brake pads · Bosch", "part", 1450, { partId: "pads", brand: "Bosch" }),
    ],
    log: [{ time: "3:50 PM", text: "Inspection started by Imran" }],
  },
  {
    id: "j3", plate: "MH 12 AB 7710", vehicle: "Honda City · 2021", customer: "Vikram Joshi", phone: "+91 99230 55102",
    mechanic: "Ajay", stage: "Queued", ready: "Tomorrow", labour: 700, tool: 100,
    items: [it("AC gas top-up", "service", 1500)],
    log: [{ time: "3:10 PM", text: "Customer asked on WhatsApp: “AC is not cooling”" }],
  },
  {
    id: "j4", plate: "MH 20 EF 3302", vehicle: "Tata Nexon · 2022", customer: "Sana Sheikh", phone: "+91 98900 11876",
    mechanic: "Imran", stage: "Done", ready: "Delivered", labour: 600, tool: 100,
    items: [it("Wheel alignment", "service", 800)],
    log: [{ time: "1:15 PM", text: "Bill G-1041 ₹1,500 sent · paid by UPI" }],
    billId: "b0",
  },
];

const bill = (b: Omit<Bill, "lines"> & { lines?: Bill["lines"] }): Bill => ({ lines: [{ label: "Work and parts", price: b.total }], ...b });

export const seedBills = (): Bill[] => [
  bill({ id: "b0", jobId: "j4", plate: "MH 20 EF 3302", vehicle: "Tata Nexon", customer: "Sana Sheikh", total: 1500, method: "UPI", day: 8, paidDay: 8,
    lines: [{ label: "Wheel alignment", price: 800 }, { label: "Labour", price: 600 }, { label: "Tool charges", price: 100 }] }),
  bill({ id: "b1", plate: "MH 12 ZX 2208", vehicle: "Kia Seltos", customer: "Amit Kulkarni", total: 8450, method: "UPI", day: 7, paidDay: 7,
    lines: [{ label: "Clutch plate · Valeo", price: 4800 }, { label: "Clutch overhaul", price: 2200 }, { label: "Labour", price: 1200 }, { label: "Tool charges", price: 250 }] }),
  bill({ id: "b2", plate: "MH 14 PL 6619", vehicle: "Maruti Baleno", customer: "Neha Patil", total: 3200, method: "Cash", day: 6, paidDay: 6 }),
  bill({ id: "b3", plate: "MH 12 CD 1175", vehicle: "Toyota Innova", customer: "Farhan Ali", total: 12900, method: "UPI", day: 4, paidDay: 4,
    lines: [{ label: "Timing belt · Gates", price: 2300 }, { label: "Battery · Amaron", price: 6200 }, { label: "Labour", price: 3800 }, { label: "Tool charges", price: 600 }] }),
  bill({ id: "b4", plate: "MH 12 QR 4821", vehicle: "Hyundai i20", customer: "Rohan Deshmukh", total: 2900, method: "Cash", day: 2, paidDay: 2,
    lines: [{ label: "Brake pads · Brembo", price: 1450 }, { label: "Brake service", price: 900 }, { label: "Labour", price: 450 }, { label: "Tool charges", price: 100 }] }),
  bill({ id: "b5", plate: "MH 14 GH 5521", vehicle: "Mahindra XUV300", customer: "Sachin More", total: 4600, method: "Due", day: 5,
    lines: [{ label: "Suspension check", price: 1200 }, { label: "Bushes", price: 2400 }, { label: "Labour", price: 850 }, { label: "Tool charges", price: 150 }] }),
];

export const seedMechanics = (): Mechanic[] => [
  { id: "m1", name: "Ajay", role: "Senior mechanic", wage: 18000 },
  { id: "m2", name: "Imran", role: "Electrical & AC", wage: 16000 },
  { id: "m3", name: "Sunil", role: "Helper", wage: 9000 },
];

/** Money that came in on earlier days of the month, before this demo's bills. */
export const DAILY_SEED: Record<number, { earn: number; jobs: number }> = {
  1: { earn: 6400, jobs: 3 }, 2: { earn: 9200, jobs: 4 }, 3: { earn: 0, jobs: 0 }, 4: { earn: 12900, jobs: 2 },
  5: { earn: 7800, jobs: 3 }, 6: { earn: 3200, jobs: 1 }, 7: { earn: 8450, jobs: 2 },
};

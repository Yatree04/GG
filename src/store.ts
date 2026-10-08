import { useRef, useState } from "react";
import {
  APPROVAL_LIMIT, TODAY, firstName, inr, isAgreeing, jobTotal, nextStage, qty, seedBills, seedJobs, seedMechanics,
  seedParts, shortVehicle, uid, type Bill, type Item, type Job, type Mechanic, type Part, type PayMethod,
} from "./model";

export type Tab = "Stock" | "Jobs" | "My Garage";
export type StockFilter = "all" | "low" | "order";
export type GarageView = "Money" | "Restock" | "Team";
export type Notice = { msg: string; undo?: () => void };

/** All app state and every action that changes it. Tabs only read state and call these. */
export function useGarage() {
  const [tab, setTab] = useState<Tab>("Jobs");
  const [parts, setParts] = useState(seedParts);
  const [jobs, setJobs] = useState(seedJobs);
  const [bills, setBills] = useState(seedBills);
  const [mechanics, setMechanics] = useState(seedMechanics);
  /** extra money spent on stock this month, by day */
  const [spend, setSpend] = useState<Record<number, number>>({});
  const [currentJob, setCurrentJob] = useState("j1");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [garageView, setGarageView] = useState<GarageView>("Money");
  const [billOpen, setBillOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [clock, setClock] = useState(16 * 60 + 12);
  const timer = useRef<number | undefined>(undefined);
  const clockRef = useRef(clock);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const now = () => {
    clockRef.current += 2;
    setClock(clockRef.current);
    const h = Math.floor(clockRef.current / 60), m = clockRef.current % 60;
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  const notify = (msg: string, undo?: () => void) => {
    setNotice({ msg, undo });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), undo ? 6000 : 2800);
  };

  /* ---------- stock helpers ---------- */
  const moveStock = (partId: string | undefined, brand: string | undefined, delta: number) => {
    if (!partId) return;
    setParts((ps) => ps.map((p) => (p.id !== partId ? p : {
      ...p, brands: p.brands.map((b) => (b.brand === brand ? { ...b, qty: Math.max(0, b.qty + delta) } : b)),
    })));
  };

  /* ---------- jobs ---------- */
  const patchJob = (id: string, fn: (j: Job) => Job) => setJobs((js) => js.map((j) => (j.id === id ? fn(j) : j)));
  /** Patch a job and add a log line. The time is read once, outside the state updater. */
  const patchLog = (id: string, fn: (j: Job) => Job, text: string) => {
    const entry = { time: now(), text };
    patchJob(id, (j) => { const x = fn(j); return { ...x, log: [entry, ...x.log] }; });
  };
  const job = (id: string) => jobsRef.current.find((j) => j.id === id);

  const openJob = (id: string) => { setCurrentJob(id); setTab("Jobs"); setBillOpen(null); };
  const openStock = (f: StockFilter) => { setStockFilter(f); setTab("Stock"); };
  const openGarage = (v: GarageView) => { setGarageView(v); setTab("My Garage"); };

  const addItem = (jobId: string, draft: Omit<Item, "id" | "status" | "deducted">) => {
    const j = job(jobId);
    if (!j) return;
    const needsOk = !isAgreeing(j) && draft.kind === "part" && draft.price >= APPROVAL_LIMIT;
    const item: Item = { ...draft, id: uid("i"), status: needsOk ? "pending" : "ok", deducted: !needsOk && !!draft.partId };
    if (item.deducted) moveStock(item.partId, item.brand, -1);
    const who = firstName(j.customer);
    const text = isAgreeing(j) ? `Added ${draft.label} to the estimate`
      : needsOk ? `Asked ${who} to approve ${draft.label} ${inr(draft.price)}`
      : `Added ${draft.label} ${inr(draft.price)} · ${who} told the new total`;
    patchLog(jobId, (x) => ({ ...x, items: [...x.items, item] }), text);
    notify(isAgreeing(j) ? `${draft.label} added to the estimate` : needsOk ? `Sent to ${who} on WhatsApp for approval` : `${draft.label} added · ${who} got the new total`,
      () => removeItem(jobId, item.id, true));
  };

  const removeItem = (jobId: string, itemId: string, silent = false) => {
    const item = job(jobId)?.items.find((i) => i.id === itemId);
    if (!item) return;
    if (item.deducted) moveStock(item.partId, item.brand, +1);
    patchJob(jobId, (j) => ({ ...j, items: j.items.filter((i) => i.id !== itemId) }));
    if (!silent) notify("Item removed from the bill");
  };

  /** The customer's WhatsApp reply, recorded by the owner (or arriving by itself in the real app). */
  const reply = (jobId: string, itemId: string, yes: boolean) => {
    const j = job(jobId), item = j?.items.find((i) => i.id === itemId);
    if (!j || !item || item.status !== "pending") return;
    if (yes) moveStock(item.partId, item.brand, -1);
    patchLog(jobId, (x) => ({
      ...x, items: x.items.map((i) => (i.id === itemId ? { ...i, status: yes ? "ok" : "declined", deducted: yes && !!i.partId } : i)),
    }), `${firstName(j.customer)} ${yes ? "approved" : "declined"} ${item.label}`);
    notify(yes ? `${firstName(j.customer)} approved ${item.label}${item.partId ? " · taken from stock" : ""}` : `${firstName(j.customer)} said no · left off the bill`);
  };

  const advance = (jobId: string) => {
    const j = job(jobId);
    if (!j) return;
    const to = nextStage(j.stage);
    const msg: Record<string, string> = {
      Inspection: `Inspection started by ${j.mechanic}`,
      "In work": `Estimate ${inr(jobTotal(j))} sent on WhatsApp · work started by ${j.mechanic}`,
      Ready: `Ready for pickup message sent · bill ${inr(jobTotal(j))}`,
    };
    patchLog(jobId, (x) => ({ ...x, stage: to }), msg[to] ?? to);
    notify(to === "In work" ? `Estimate sent to ${firstName(j.customer)} · work started` : to === "Ready" ? `${firstName(j.customer)} told the vehicle is ready` : `Inspection started`);
  };

  const sendUpdate = (jobId: string) => {
    const j = job(jobId);
    if (!j) return;
    patchLog(jobId, (x) => x, `Status update sent: ${j.stage}, ready ${j.ready}`);
    notify(`Update sent to ${firstName(j.customer)} on WhatsApp`);
  };

  const assign = (jobId: string, mechanic: string) => {
    patchLog(jobId, (x) => ({ ...x, mechanic }), `Assigned to ${mechanic}`);
    notify(`${mechanic} is on this job now`);
  };

  const closeBill = (jobId: string, method: PayMethod) => {
    const j = job(jobId);
    if (!j) return;
    const id = uid("b"), total = jobTotal(j), no = `G-${1040 + bills.length + 2}`;
    const b: Bill = {
      id, jobId, plate: j.plate, vehicle: shortVehicle(j.vehicle), customer: j.customer, total, method, day: TODAY,
      paidDay: method === "Due" ? undefined : TODAY,
      lines: [...j.items.filter((i) => i.status === "ok").map((i) => ({ label: i.label, price: i.price })),
        { label: "Labour", price: j.labour }, { label: "Tool charges", price: j.tool }],
    };
    setBills((bs) => [b, ...bs]);
    const before = j;
    patchLog(jobId, (x) => ({ ...x, stage: "Done", ready: "Delivered", billId: id }),
      `Bill ${no} ${inr(total)} sent · ${method === "Due" ? "to be paid later" : `paid by ${method}`}`);
    notify(method === "Due" ? `Bill sent · ${inr(total)} added to dues in My Garage` : `Bill ${inr(total)} paid by ${method} · logged in My Garage`, () => {
      setBills((bs) => bs.filter((x) => x.id !== id));
      setJobs((js) => js.map((x) => (x.id === jobId ? before : x)));
      setCurrentJob(jobId);
    });
  };

  const collect = (billId: string, method: Exclude<PayMethod, "Due">) => {
    const b = bills.find((x) => x.id === billId);
    setBills((bs) => bs.map((x) => (x.id === billId ? { ...x, method, paidDay: TODAY } : x)));
    if (b) notify(`${inr(b.total)} collected from ${firstName(b.customer)} by ${method}`);
  };

  const createJob = (d: { plate: string; customer: string; phone: string; vehicle: string }) => {
    const busy = new Set(jobs.filter((j) => j.stage !== "Done").map((j) => j.mechanic));
    const free = mechanics.find((m) => !busy.has(m.name))?.name ?? mechanics[0].name;
    const j: Job = {
      id: uid("j"), plate: d.plate.toUpperCase(), vehicle: d.vehicle, customer: d.customer, phone: d.phone, mechanic: free,
      stage: "Queued", ready: "Today 7:00 PM", labour: 500, tool: 100, items: [],
      log: [{ time: now(), text: `Job card opened · welcome message sent to ${firstName(d.customer)}` }],
    };
    setJobs((js) => [j, ...js]);
    setCurrentJob(j.id);
    notify(`New job card for ${j.plate} · ${free} assigned`);
  };

  /* ---------- stock & restock ---------- */
  const toggleOrder = (id: string) => {
    const p = parts.find((x) => x.id === id);
    if (!p) return;
    setParts((ps) => ps.map((x) => (x.id === id ? { ...x, toOrder: !x.toOrder, ordered: false } : x)));
    notify(p.toOrder ? `${p.name} taken off the order list` : `${p.name} added to the order list in My Garage`);
  };
  const markOrdered = (id: string) => {
    setParts((ps) => ps.map((x) => (x.id === id ? { ...x, ordered: true } : x)));
    notify("Marked as ordered · tap Received when it arrives");
  };
  const receive = (id: string) => {
    const p = parts.find((x) => x.id === id);
    if (!p) return;
    const add = Math.max(p.reorder * 2 - qty(p), 1);
    setParts((ps) => ps.map((x) => (x.id !== id ? x : {
      ...x, toOrder: false, ordered: false,
      brands: x.brands.map((b, i) => (i === 0 ? { ...b, qty: b.qty + add } : b)),
    })));
    setSpend((s) => ({ ...s, [TODAY]: (s[TODAY] ?? 0) + add * p.cost }));
    notify(`${add} ${p.name.toLowerCase()} added to stock · ${inr(add * p.cost)} logged as parts spend`);
  };

  const addMechanic = (name: string) => {
    setMechanics((m) => [...m, { id: uid("m"), name, role: "Mechanic", wage: 12000 }]);
    notify(`${name} added to your team`);
  };

  /* ---------- derived ---------- */
  const active = jobs.filter((j) => j.stage !== "Done");
  const pending = active.flatMap((j) => j.items.filter((i) => i.status === "pending").map((i) => ({ job: j, item: i })));
  const lowParts = parts.filter((p) => qty(p) <= p.reorder);
  const dues = bills.filter((b) => b.method === "Due");
  const mechanicJob = (m: Mechanic) => active.find((j) => j.mechanic === m.name);

  return {
    tab, setTab, parts, jobs, bills, mechanics, spend, currentJob, setCurrentJob, stockFilter, setStockFilter,
    garageView, setGarageView, billOpen, setBillOpen, notice, setNotice, clock,
    notify, openJob, openStock, openGarage, addItem, removeItem, reply, advance, sendUpdate, assign, closeBill, collect, createJob,
    toggleOrder, markOrdered, receive, addMechanic,
    active, pending, lowParts, dues, mechanicJob,
  };
}
export type Garage = ReturnType<typeof useGarage>;
export type { Part };

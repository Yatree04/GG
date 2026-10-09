import { tr, tl, useLang, setLang, LANGS } from "./i18n";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "bell"
  | "box"
  | "calendar"
  | "check"
  | "chevron"
  | "garage"
  | "globe"
  | "grid"
  | "phone"
  | "plus"
  | "search"
  | "scan"
  | "send"
  | "sliders"
  | "users"
  | "wrench";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M7 17 17 7M8 7h9v9" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
      </>
    ),
    garage: (
      <>
        <path d="m3 10 9-6 9 6v10H3z" />
        <path d="M7 20v-7h10v7M7 16h10" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    phone: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    scan: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" />,
    send: <path d="M21 3 3 10.5l7 2.5 2.5 7zM10 13l11-10" />,
    sliders: <path d="M6 4v6M6 14v6M12 4v2M12 10v10M18 4v10M18 18v2M4 10h4M10 6h4M16 14h4" />,
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
      </>
    ),
    wrench: (
      <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17l3 3 8.3-8.3a4 4 0 0 0 5-5L18 9l-2.4-2.4L18 4.3z" />
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

type Brand = { brand: string; qty: number };
type Part = {
  id: string;
  name: string;
  reorder: number;
  price: number;
  toOrder: boolean;
  ordered?: boolean;
  brands: Brand[];
};
type Item = {
  id: string;
  label: string;
  kind: "service" | "part";
  price: number;
  approved: boolean;
  partId?: string;
  brand?: string;
};
type Job = {
  id: string;
  plate: string;
  vehicle: string;
  customer: string;
  phone: string;
  mechanic: string;
  stage: string;
  ready: string;
  labour: number;
  tool: number;
  done: boolean;
  notified: boolean;
  paid?: string;
  items: Item[];
};
type Bill = {
  id: string;
  plate: string;
  vehicle: string;
  total: number;
  method: string;
  day: number;
  summary: string;
  fresh?: boolean;
};
type Mechanic = { id: string; name: string; role: string; wage: number; status: string };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const total = (p: Part) => p.brands.reduce((s, b) => s + b.qty, 0);
const billTotal = (j: Job) =>
  j.items.filter((i) => i.approved).reduce((s, i) => s + i.price, 0) + j.labour + j.tool;

const initialParts: Part[] = [
  { id: "piston", name: "Pistons", reorder: 6, price: 1850, toOrder: false, brands: [{ brand: "Bosch", qty: 5 }, { brand: "Mahle", qty: 3 }, { brand: "Hepu", qty: 2 }] },
  { id: "pads", name: "Brake pads", reorder: 8, price: 1450, toOrder: false, brands: [{ brand: "Brembo", qty: 4 }, { brand: "Bosch", qty: 3 }] },
  { id: "oilf", name: "Oil filters", reorder: 10, price: 320, toOrder: false, brands: [{ brand: "Mann", qty: 9 }, { brand: "Fram", qty: 7 }, { brand: "Purolator", qty: 6 }] },
  { id: "plugs", name: "Spark plugs", reorder: 12, price: 410, toOrder: false, brands: [{ brand: "NGK", qty: 10 }, { brand: "Denso", qty: 8 }] },
  { id: "batt", name: "Batteries", reorder: 4, price: 6200, toOrder: false, brands: [{ brand: "Exide", qty: 2 }, { brand: "Amaron", qty: 1 }] },
  { id: "belt", name: "Timing belts", reorder: 4, price: 2300, toOrder: false, brands: [{ brand: "Gates", qty: 4 }, { brand: "Contitech", qty: 2 }] },
  { id: "oil", name: "Engine oil (5L)", reorder: 8, price: 2150, toOrder: false, brands: [{ brand: "Castrol", qty: 7 }, { brand: "Mobil", qty: 6 }] },
  { id: "bulb", name: "Headlight bulbs", reorder: 10, price: 380, toOrder: false, brands: [{ brand: "Philips", qty: 12 }, { brand: "Osram", qty: 9 }] },
  { id: "clutch", name: "Clutch plates", reorder: 3, price: 4800, toOrder: false, brands: [{ brand: "Valeo", qty: 2 }] },
];

const initialJobs: Job[] = [
  {
    id: "j1", plate: "MH 12 QR 4821", vehicle: "Hyundai i20 · 2019", customer: "Rohan Deshmukh", phone: "+91 98220 41877",
    mechanic: "Ajay", stage: "In work", ready: "5:00 PM", labour: 900, tool: 150, done: false, notified: false,
    items: [
      { id: "i1", label: "Full service + oil change", kind: "service", price: 1800, approved: true },
      { id: "i2", label: "Oil filter · Mann", kind: "part", price: 320, approved: true, partId: "oilf", brand: "Mann" },
      { id: "i3", label: "Engine oil 5L · Castrol", kind: "part", price: 2150, approved: true, partId: "oil", brand: "Castrol" },
    ],
  },
  {
    id: "j2", plate: "MH 14 DK 0937", vehicle: "Maruti Swift · 2016", customer: "Priya Nair", phone: "+91 97650 22314",
    mechanic: "Imran", stage: "Inspection", ready: "6:30 PM", labour: 1200, tool: 200, done: false, notified: false,
    items: [
      { id: "i4", label: "Brake inspection", kind: "service", price: 400, approved: true },
      { id: "i5", label: "Brake pads · Bosch", kind: "part", price: 1450, approved: true, partId: "pads", brand: "Bosch" },
    ],
  },
  {
    id: "j3", plate: "MH 12 AB 7710", vehicle: "Honda City · 2021", customer: "Vikram Joshi", phone: "+91 99230 55102",
    mechanic: "Ajay", stage: "Queued", ready: "Tomorrow", labour: 700, tool: 100, done: false, notified: false,
    items: [{ id: "i6", label: "AC gas top-up", kind: "service", price: 1500, approved: true }],
  },
  {
    id: "j4", plate: "MH 20 EF 3302", vehicle: "Tata Nexon · 2022", customer: "Sana Sheikh", phone: "+91 98900 11876",
    mechanic: "Imran", stage: "Done", ready: "Delivered", labour: 600, tool: 100, done: true, notified: true, paid: "UPI",
    items: [{ id: "i7", label: "Wheel alignment", kind: "service", price: 800, approved: true }],
  },
];

const initialBills: Bill[] = [
  { id: "b1", plate: "MH 12 ZX 2208", vehicle: "Kia Seltos", total: 8450, method: "UPI", day: 7, summary: "Clutch plate, labour" },
  { id: "b2", plate: "MH 14 PL 6619", vehicle: "Maruti Baleno", total: 3200, method: "Cash", day: 6, summary: "Full service" },
  { id: "b3", plate: "MH 12 CD 1175", vehicle: "Toyota Innova", total: 12900, method: "UPI", day: 4, summary: "Timing belt, battery" },
];

const mechanicsSeed: Mechanic[] = [
  { id: "m1", name: "Ajay", role: "Senior mechanic", wage: 18000, status: "On job" },
  { id: "m2", name: "Imran", role: "Electrical & AC", wage: 16000, status: "On job" },
  { id: "m3", name: "Sunil", role: "Helper", wage: 9000, status: "Free" },
];

const dailySeed: Record<number, { earn: number; jobs: number }> = {
  1: { earn: 6400, jobs: 3 }, 2: { earn: 9200, jobs: 4 }, 3: { earn: 0, jobs: 0 }, 4: { earn: 12900, jobs: 2 },
  5: { earn: 7800, jobs: 3 }, 6: { earn: 3200, jobs: 1 }, 7: { earn: 8450, jobs: 2 },
};
const MONTH_BASE_IN = 47950;
const PARTS_SPEND = 18400;
const TODAY = 8;

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid rounded-full bg-[#e6dfda] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`h-9 rounded-lg text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#222] ${
            value === o ? "bg-white text-[#222] shadow-m1" : "text-[#667069] hover:text-[#222]"
          }`}
        >
          {tr(o)}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [nav, setNav] = useState<"Stock" | "Jobs" | "My Garage">("Jobs");
  const [parts, setParts] = useState(initialParts);
  const [jobs, setJobs] = useState(initialJobs);
  const [bills, setBills] = useState(initialBills);
  const [mechanics, setMechanics] = useState(mechanicsSeed);
  const [bell, setBell] = useState(false);
  const [jobsKey, setJobsKey] = useState(0);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | undefined>(undefined);

  const notify = (m: string) => {
    setNotice(m);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2400);
  };

  const toggleOrder = (id: string) => {
    const p = parts.find((x) => x.id === id);
    if (!p) return;
    setParts((ps) => ps.map((x) => (x.id === id ? { ...x, toOrder: !x.toOrder } : x)));
    notify(tr(p.toOrder ? "{name} removed from order list" : "{name} added to My Garage orders", { name: tr(p.name) }));
  };

  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const approve = (jobId: string, itemId: string) => {
    const item = jobsRef.current.find((j) => j.id === jobId)?.items.find((i) => i.id === itemId);
    if (!item || item.approved) return;
    setJobs((js) =>
      js.map((j) =>
        j.id !== jobId ? j : { ...j, items: j.items.map((i) => (i.id === itemId ? { ...i, approved: true } : i)) },
      ),
    );
    if (item.partId) {
      setParts((ps) =>
        ps.map((p) =>
          p.id !== item.partId
            ? p
            : { ...p, brands: p.brands.map((b) => (b.brand === item.brand && b.qty > 0 ? { ...b, qty: b.qty - 1 } : b)) },
        ),
      );
    }
    notify(tr("Customer approved {item}", { item: tl(item.label) }));
  };

  const addItems = (jobId: string, items: Omit<Item, "id" | "approved">[]) => {
    const stamp = Date.now();
    const withIds = items.map((it, k) => ({ ...it, id: `n${stamp}-${k}`, approved: false }));
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, items: [...j.items, ...withIds] } : j)));
    notify(tr("Sent to customer on WhatsApp for approval"));
    withIds.forEach((it) => window.setTimeout(() => approve(jobId, it.id), 5000));
  };

  const addJob = (d: { plate: string; vehicle: string; customer: string; phone: string }) => {
    const id = `j${Date.now()}`;
    setJobs((js) => [
      {
        id, plate: d.plate, vehicle: d.vehicle, customer: d.customer, phone: d.phone, mechanic: "Sunil",
        stage: "Received", ready: "Today", labour: 0, tool: 0, done: false, notified: false, items: [],
      },
      ...js,
    ]);
    notify(tr("Work created for {plate}", { plate: d.plate }));
    return id;
  };

  const setStage = (jobId: string, stage: string) => {
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, stage } : j)));
    notify(stage === "Ready" ? tr("Marked ready for pickup") : tr("Moved to {stage}", { stage: tr(stage) }));
  };

  const markDone = (jobId: string, method: string) => {
    const j = jobs.find((x) => x.id === jobId);
    if (!j) return;
    setJobs((js) => js.map((x) => (x.id === jobId ? { ...x, done: true, stage: "Done", ready: "Delivered", paid: method } : x)));
    setBills((b) => [
      {
        id: `b${Date.now()}`, plate: j.plate, vehicle: j.vehicle.split(" · ")[0], total: billTotal(j), method, day: TODAY, fresh: true,
        summary: j.items.filter((i) => i.approved).slice(0, 2).map((i) => i.label.split(" · ")[0]).join(", "),
      },
      ...b,
    ]);
    notify(tr("Bill {amount} logged to My Garage", { amount: inr(billTotal(j)) }));
  };

  const addPart = (d: { name: string; brand: string; qty: number; price: number; reorder: number }) => {
    setParts((ps) => [...ps, { id: `p${Date.now()}`, name: d.name, reorder: d.reorder, price: d.price, toOrder: false, brands: [{ brand: d.brand, qty: d.qty }] }]);
    notify(tr("{name} added to stock", { name: tr(d.name) }));
  };

  const receiveStock = (id: string, brand: string, qty: number) => {
    const name = parts.find((p) => p.id === id)?.name ?? "Part";
    setParts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const has = p.brands.some((b) => b.brand.toLowerCase() === brand.toLowerCase());
        const brands = has
          ? p.brands.map((b) => (b.brand.toLowerCase() === brand.toLowerCase() ? { ...b, qty: b.qty + qty } : b))
          : [...p.brands, { brand, qty }];
        return { ...p, toOrder: false, ordered: false, brands };
      }),
    );
    notify(tr("{qty} {name} added to stock", { qty, name: tr(name) }));
  };

  const markOrdered = (id: string) => {
    setParts((ps) => ps.map((p) => (p.id === id ? { ...p, toOrder: false, ordered: true } : p)));
    notify(tr("Marked as ordered. Waiting for delivery"));
  };

  const notifyCustomer = (jobId: string) => {
    setJobs((js) => js.map((x) => (x.id === jobId ? { ...x, notified: true } : x)));
    notify(tr("Customer notified on WhatsApp"));
  };

  const navItems: { label: typeof nav; icon: IconName }[] = [
    { label: "Jobs", icon: "wrench" },
    { label: "Stock", icon: "box" },
    { label: "My Garage", icon: "garage" },
  ];

  return (
    <main className="min-h-dvh bg-[#ebe6e2] text-[#222] sm:px-6 sm:py-8">
      <div className="mx-auto w-full overflow-hidden bg-[#ffffff] shadow-m5 sm:max-w-[430px] sm:rounded-[40px] sm:border sm:border-black/10">
        <div className="relative flex h-dvh flex-col sm:h-[860px]">
          <header className="shrink-0 px-6 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mt-1 text-[26px] leading-8 font-semibold tracking-[-0.04em]">{tr("Sharma Motors")}</h1>
              </div>
              <div className="flex items-center gap-2">
              <button
                aria-label={tr("Language")}
                className="grid size-12 place-items-center rounded-full bg-[#f4f0ed] shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
                onClick={() => { setBell(false); setLangOpen(true); }}
              >
                <Icon name="globe" />
              </button>
              <button
                aria-label={tr("Notifications")}
                className="relative grid size-12 place-items-center rounded-full bg-[#f4f0ed] shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
                onClick={() => { setLangOpen(false); setBell(true); }}
              >
                <Icon name="bell" />
                {(parts.some((p) => total(p) <= p.reorder) || jobs.some((j) => !j.done && j.items.some((i) => !i.approved))) && <span className="absolute top-3 right-3 size-2 rounded-full bg-[#ff715b] ring-2 ring-white" />}
              </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1">
            {langOpen && <LanguageView onBack={() => setLangOpen(false)} />}
            {!langOpen && bell && (
              <NotificationsView parts={parts} jobs={jobs} bills={bills} onBack={() => setBell(false)} go={(t) => { setBell(false); setNav(t); }} />
            )}
            {!langOpen && !bell && nav === "Stock" && <StockTab parts={parts} toggleOrder={toggleOrder} addPart={addPart} receiveStock={receiveStock} />}
            {!langOpen && !bell && nav === "Jobs" && (
              <JobsTab key={jobsKey} jobs={jobs} parts={parts} addItems={addItems} addJob={addJob} setStage={setStage} markDone={markDone} notifyCustomer={notifyCustomer} notify={notify} />
            )}
            {!langOpen && !bell && nav === "My Garage" && (
              <GarageTab markOrdered={markOrdered} receiveStock={receiveStock}
                parts={parts} jobs={jobs} bills={bills} mechanics={mechanics}
                toggleOrder={toggleOrder}
                addMechanic={(m) => { setMechanics((x) => [...x, m]); notify(tr("{name} added to your team", { name: m.name })); }}
              />
            )}
          </div>

          <nav aria-label={tr("Primary navigation")} className="shrink-0 bg-white px-4 pt-2 pb-5">
            <div className="grid h-20 grid-cols-3 items-center rounded-full bg-[#f4f0ed] px-2 shadow-m3">
              {navItems.map(({ label, icon }) => {
                const active = nav === label && !bell && !langOpen;
                const orders = label === "My Garage" ? parts.filter((p) => p.toOrder).length : 0;
                return (
                  <button
                    key={label}
                    aria-current={active ? "page" : undefined}
                    aria-label={tr(label)}
                    onClick={() => { if (label === "Jobs" && nav === "Jobs") setJobsKey((k) => k + 1); setBell(false); setLangOpen(false); setNav(label); }}
                    className="group relative flex h-full items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
                  >
                    {active ? (
                      <span className="relative grid size-[68px] place-items-center rounded-full bg-[#222] text-white shadow-m3">
                        <Icon name={icon} className="size-7" />
                      </span>
                    ) : (
                      <span className="relative flex flex-col items-center gap-1 text-[#6e6762] transition group-hover:text-[#222]">
                        <Icon name={icon} className="size-7" />
                        <span className="text-xs font-medium">{tr(label)}</span>
                      </span>
                    )}
                    {orders > 0 && (
                      <span className="absolute top-2 right-[22%] grid size-5 place-items-center rounded-full bg-[#ff4d0a] text-[10px] font-medium text-white ring-2 ring-[#f4f0ed]">
                        {orders}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div
            aria-live="polite"
            className={`pointer-events-none absolute right-6 bottom-32 left-6 z-20 rounded-3xl bg-[#222] px-4 py-3 text-center text-sm font-medium text-white shadow-m4 transition-all ${
              notice ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {notice}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------- STOCK --------------------------------- */

function StockTab({
  parts, toggleOrder, addPart, receiveStock,
}: {
  parts: Part[];
  toggleOrder: (id: string) => void;
  addPart: (d: { name: string; brand: string; qty: number; price: number; reorder: number }) => void;
  receiveStock: (id: string, brand: string, qty: number) => void;
}) {
  const [view, setView] = useState<"list" | "add" | "receive">("list");
  const [recId, setRecId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "order">("all");
  const [open, setOpen] = useState<string | null>(null);

  const units = parts.reduce((s, p) => s + total(p), 0);
  const lowParts = parts.filter((p) => total(p) <= p.reorder);
  const orderParts = parts.filter((p) => p.toOrder);
  const value = parts.reduce((s, p) => s + total(p) * p.price, 0);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return parts.filter((p) => {
      const matches = !s || p.name.toLowerCase().includes(s) || p.brands.some((b) => b.brand.toLowerCase().includes(s));
      const scoped = filter === "all" || (filter === "low" ? total(p) <= p.reorder : p.toOrder);
      return matches && scoped;
    });
  }, [parts, q, filter]);

  const tiles: { key: "all" | "low" | "order" | "value"; label: string; value: string; icon: IconName }[] = [
    { key: "all", label: "Total parts", value: String(units), icon: "box" },
    { key: "low", label: "Running low", value: String(lowParts.length), icon: "bell" },
    { key: "order", label: "To order", value: String(orderParts.length), icon: "send" },
    { key: "value", label: "Stock value", value: inr(value), icon: "garage" },
  ];

  const recPart = parts.find((p) => p.id === recId);
  if (view === "add")
    return <AddPartView onBack={() => setView("list")} onCreate={(d) => { addPart(d); setView("list"); }} />;
  if (view === "receive" && recPart)
    return <ReceiveView part={recPart} onBack={() => setView("list")} onReceive={(b, n) => { receiveStock(recPart.id, b, n); setView("list"); }} />;

  return (
    <div className="flex h-full flex-col px-6">
      <label className="relative flex h-12 shrink-0 items-center rounded-full bg-[#f4f0ed] shadow-m1 pr-4 pl-4 focus-within:border-[#222]">
        <span className="sr-only">{tr("Search parts")}</span>
        <Icon name="search" className="size-5 shrink-0 text-[#6e6762]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr("Search pistons, brake pads, Bosch…")}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-[#6e6762]"
        />
      </label>

      <div className="mt-3 grid shrink-0 grid-cols-2 gap-2">
        {tiles.map((t) => {
          const active = t.key === "value" ? false : filter === t.key;
          return (
            <button
              key={t.key}
              aria-pressed={active}
              onClick={() => setFilter(t.key === "value" ? "all" : t.key)}
              className={`flex h-[108px] flex-col justify-between rounded-3xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${
                active ? "border-transparent bg-[#ff4d0a] text-white" : "border-black/10 bg-white hover:bg-[#ebe5e1]"
              }`}
            >
              <span className="flex items-start justify-between">
                <span className={`grid size-9 place-items-center rounded-xl ${active ? "bg-white/20" : "bg-[#e6dfda]"}`}>
                  <Icon name={t.icon} className="size-5" />
                </span>
              </span>
              <span>
                <span className={`block text-xs font-medium ${active ? "text-white/85" : "text-[#6e6762]"}`}>{tr(t.label)}</span>
                <span className="block text-2xl leading-7 font-extrabold tracking-[-0.03em]">{t.value}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex shrink-0 items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">{tr("Stock overview")}</h2>
        <button onClick={() => setView("add")} className={`${pillSoft} h-10 px-4`}>
          <Icon name="plus" className="size-4" /> {tr("Add part")}
        </button>
      </div>

      <div className="no-scrollbar mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pb-3">
        {list.length === 0 && <p className="py-8 text-center text-sm text-[#6e6762]">{q ? tr("Nothing here for “{q}”.", { q }) : tr("Nothing here.")}</p>}
        {list.map((p) => {
          const t = total(p);
          const isLow = t <= p.reorder;
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="rounded-3xl bg-[#f4f0ed] shadow-m1">
              <button
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.id)}
                className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-[#222]"
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold ${isLow ? "bg-[#ffdbcf]" : "bg-[#e6dfda]"}`}>
                  {t}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{tr(p.name)}</span>
                  <span className="mt-0.5 block text-xs text-[#6e6762]">
                    {tr(p.brands.length > 1 ? "{n} brands" : "{n} brand", { n: p.brands.length })} · {isLow ? tr("low, reorder at {n}", { n: p.reorder }) : tr("{price} each", { price: inr(p.price) })}
                  </span>
                </span>
                {p.toOrder && <span className="rounded-full bg-[#ff4d0a] px-2 py-1 text-[10px] font-medium text-white">{tr("TO ORDER")}</span>}
                {p.ordered && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium">{tr("ORDERED")}</span>}
                <Icon name="chevron" className={`size-4 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-black/10 px-3 pt-2 pb-3">
                  {p.brands.map((b) => (
                    <div key={b.brand} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-[#4a4542]">{b.brand}</span>
                      <span className="font-semibold">{b.qty}</span>
                    </div>
                  ))}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => { setRecId(p.id); setView("receive"); }} className={`${pillSoft} h-12`}>
                      {tr("Receive stock")}
                    </button>
                    <button onClick={() => toggleOrder(p.id)} className={`${p.toOrder ? pillSoft : pillPrimary} h-12`}>
                      {tr(p.toOrder ? "Remove from list" : "Mark to order")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------- SHARED SCREENS (stock forms, receipt, alerts) ------------------------- */

const inputCls =
  "h-12 w-full min-w-0 rounded-2xl border border-[#222] bg-transparent px-4 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#6e6762] focus:shadow-m1 focus:ring-2 focus:ring-[#ff4d0a]";

function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const btn = "grid size-12 place-items-center rounded-full bg-[#f4f0ed] text-xl font-extrabold shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] disabled:text-[#6e6762]/50 disabled:shadow-none";
  return (
    <div className="flex items-center justify-between" role="group" aria-label={tr(label)}>
      <span className="text-sm font-extrabold">{tr(label)}</span>
      <div className="flex items-center gap-4">
        <button aria-label={tr("Decrease {label}", { label: tr(label) })} disabled={value <= 1} onClick={() => onChange(value - 1)} className={btn}>−</button>
        <span className="w-10 text-center text-2xl font-extrabold tracking-[-0.02em]">{value}</span>
        <button aria-label={tr("Increase {label}", { label: tr(label) })} onClick={() => onChange(value + 1)} className={btn}>+</button>
      </div>
    </div>
  );
}

function AddPartView({
  onBack, onCreate,
}: {
  onBack: () => void;
  onCreate: (d: { name: string; brand: string; qty: number; price: number; reorder: number }) => void;
}) {
  const [v, setV] = useState({ name: "", brand: "", price: "", reorder: "" });
  const [qty, setQty] = useState(5);
  const ready = v.name.trim() && v.brand.trim() && Number(v.price) > 0;
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="flex shrink-0 items-center pb-4">
        <BackButton onClick={onBack} />
        <h2 className="flex-1 pr-12 text-center text-xl font-extrabold tracking-[-0.02em]">{tr("Add new part")}</h2>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pt-1 pb-3">
        <input aria-label={tr("Part name")} placeholder={tr("PART NAME")} value={v.name} onChange={set("name")} className={inputCls} />
        <input aria-label={tr("Brand")} placeholder={tr("BRAND")} value={v.brand} onChange={set("brand")} className={inputCls} />
        <input aria-label={tr("Price each")} placeholder={tr("PRICE EACH (₹)")} inputMode="numeric" value={v.price} onChange={set("price")} className={inputCls} />
        <input aria-label={tr("Reorder level")} placeholder={tr("REORDER LEVEL (default 5)")} inputMode="numeric" value={v.reorder} onChange={set("reorder")} className={inputCls} />
        <div className="pt-2"><Stepper label="Quantity" value={qty} onChange={setQty} /></div>
      </div>
      <button
        disabled={!ready}
        onClick={() => onCreate({ name: v.name.trim(), brand: v.brand.trim(), qty, price: Number(v.price), reorder: Number(v.reorder) || 5 })}
        className={`${pillPrimary} h-14 w-full`}
      >
        {tr("Add to stock")}
      </button>
    </div>
  );
}

function ReceiveView({
  part, onBack, onReceive,
}: {
  part: Part;
  onBack: () => void;
  onReceive: (brand: string, qty: number) => void;
}) {
  const [brand, setBrand] = useState(part.brands[0]?.brand ?? "");
  const [custom, setCustom] = useState("");
  const [qty, setQty] = useState(Math.max(1, part.reorder));
  const chosen = custom.trim() || brand;
  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="flex shrink-0 items-start pb-4">
        <BackButton onClick={onBack} />
        <div className="flex-1 px-3 text-center">
          <h2 className="text-xl leading-7 font-extrabold tracking-[-0.02em]">{tr("Receive stock")}</h2>
          <p className="mt-1 text-xs text-[#6e6762]">{tr("{name} · {n} in stock now", { name: tr(part.name), n: total(part) })}</p>
        </div>
        <span className="size-12 shrink-0" />
      </div>
      <div className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pt-1">
        <div>
          <p className="mb-2 text-sm font-extrabold">{tr("Brand")}</p>
          <div className="flex flex-wrap gap-2">
            {part.brands.map((b) => {
              const on = !custom.trim() && brand === b.brand;
              return (
                <button
                  key={b.brand}
                  aria-pressed={on}
                  onClick={() => { setBrand(b.brand); setCustom(""); }}
                  className={`h-10 rounded-full px-4 text-sm font-extrabold shadow-m1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${on ? "bg-[#ff4d0a] text-white" : "bg-[#f4f0ed] hover:bg-[#ebe5e1]"}`}
                >
                  {b.brand} · {b.qty}
                </button>
              );
            })}
          </div>
          <input aria-label={tr("New brand")} placeholder={tr("OR TYPE A NEW BRAND")} value={custom} onChange={(e) => setCustom(e.target.value)} className={`${inputCls} mt-3`} />
        </div>
        <Stepper label="Units received" value={qty} onChange={setQty} />
        <div className="rounded-3xl bg-[#f4f0ed] p-4 shadow-m1">
          <div className="flex justify-between text-sm"><span>{tr("New total")}</span><span className="font-extrabold">{total(part) + qty}</span></div>
          <div className="mt-1 flex justify-between text-sm"><span>{tr("Stock value added")}</span><span className="font-extrabold">{inr(qty * part.price)}</span></div>
        </div>
      </div>
      <button disabled={!chosen} onClick={() => onReceive(chosen, qty)} className={`${pillPrimary} h-14 w-full`}>
        {tr("Add {n} to stock", { n: qty })}
      </button>
    </div>
  );
}

type ReceiptData = {
  plate: string;
  vehicle: string;
  customer?: string;
  rows: [string, number][];
  total: number;
  method: string;
  day: string;
  fresh?: boolean;
};

function Receipt({ d, onBack, backLabel }: { d: ReceiptData; onBack: () => void; backLabel: string }) {
  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {d.fresh ? (
          <div className="flex flex-col items-center pt-2 pb-5 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-[#2e7d32] text-white shadow-m3"><Icon name="check" className="size-8" /></span>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.02em]">{tr("Payment received")}</h2>
            <p className="text-xs text-[#6e6762]">{tr("Bill logged to My Garage")}</p>
          </div>
        ) : (
          <div className="flex items-center pb-4">
            <BackButton onClick={onBack} />
            <h2 className="flex-1 pr-12 text-center text-xl font-extrabold tracking-[-0.02em]">{tr("Bill")}</h2>
          </div>
        )}
        <section className="rounded-3xl bg-[#f4f0ed] p-5 shadow-m2">
          <p className="text-2xl font-extrabold tracking-[0.01em]">{d.plate}</p>
          <p className="text-sm text-[#4a4542]">{d.vehicle}{d.customer ? ` · ${d.customer}` : ""}</p>
          <div className="mt-3 border-t border-dashed border-black/20 pt-2">
            {d.rows.map(([l, p], i) => (
              <div key={i} className="flex justify-between gap-3 py-1.5 text-sm"><span>{tl(l)}</span><span className="font-extrabold">{inr(p)}</span></div>
            ))}
          </div>
          <div className="mt-2 flex items-end justify-between border-t border-dashed border-black/20 pt-3">
            <span className="text-sm font-extrabold">{tr("Total paid")}</span>
            <span className="text-[28px] leading-8 font-extrabold tracking-[-0.02em]">{inr(d.total)}</span>
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#6e6762]"><span>{d.day}</span><span>{tr("Paid via {method}", { method: tr(d.method) })}</span></div>
        </section>
      </div>
      <button onClick={onBack} className={`${pillPrimary} mt-3 h-14 w-full`}>{tr(backLabel)}</button>
    </div>
  );
}

function jobReceipt(j: Job, fresh = false): ReceiptData {
  const rows: [string, number][] = j.items.filter((i) => i.approved).map((i) => [i.label, i.price]);
  if (j.labour + j.tool > 0) rows.push(["Labour charges", j.labour + j.tool]);
  return { plate: j.plate, vehicle: j.vehicle, customer: j.customer, rows, total: billTotal(j), method: j.paid ?? "UPI", day: `${TODAY} Oct 2026`, fresh };
}

function NotificationsView({
  parts, jobs, bills, onBack, go,
}: {
  parts: Part[];
  jobs: Job[];
  bills: Bill[];
  onBack: () => void;
  go: (tab: "Stock" | "Jobs" | "My Garage") => void;
}) {
  const low = parts.filter((p) => total(p) <= p.reorder);
  const waiting = jobs.filter((j) => !j.done && j.items.some((i) => !i.approved));
  const ready = jobs.filter((j) => !j.done && j.stage === "Ready");
  const paid = bills.filter((b) => b.fresh);
  const rows: { key: string; title: string; sub: string; tab: "Stock" | "Jobs" | "My Garage"; icon: IconName }[] = [
    ...waiting.map((j) => ({ key: `w${j.id}`, title: tr("{plate} awaiting approval", { plate: j.plate }), sub: tr("{name} has items to approve", { name: j.customer }), tab: "Jobs" as const, icon: "send" as IconName })),
    ...ready.map((j) => ({ key: `r${j.id}`, title: tr("{plate} is ready", { plate: j.plate }), sub: tr("Tell the customer and take payment"), tab: "Jobs" as const, icon: "check" as IconName })),
    ...low.map((p) => ({ key: `l${p.id}`, title: tr("{name} running low", { name: tr(p.name) }), sub: tr("{n} left, reorder at {r}", { n: total(p), r: p.reorder }), tab: "Stock" as const, icon: "box" as IconName })),
    ...paid.map((b) => ({ key: `b${b.id}`, title: tr("{amount} received", { amount: inr(b.total) }), sub: `${b.plate} · ${tr(b.method)}`, tab: "My Garage" as const, icon: "garage" as IconName })),
  ];
  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="flex shrink-0 items-center pb-4">
        <BackButton onClick={onBack} />
        <h2 className="flex-1 pr-12 text-center text-xl font-extrabold tracking-[-0.02em]">{tr("Notifications")}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#f4f0ed] shadow-m1"><Icon name="check" className="size-8" /></span>
            <p className="mt-3 text-base font-extrabold">{tr("You are all caught up")}</p>
            <p className="text-xs text-[#6e6762]">{tr("Nothing needs your attention right now.")}</p>
          </div>
        </div>
      ) : (
        <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pt-1">
          {rows.map((r) => (
            <button key={r.key} onClick={() => go(r.tab)} className="flex w-full items-center gap-3 rounded-3xl bg-[#f4f0ed] p-3 text-left shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-[#222]">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white"><Icon name={r.icon} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">{r.title}</span>
                <span className="block truncate text-xs text-[#6e6762]">{r.sub}</span>
              </span>
              <Icon name="chevron" className="size-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- JOBS --------------------------------- */

type JobsView = "list" | "detail" | "grid" | "scan" | "create" | "add" | "receipt";
type NewJob = { plate: string; vehicle: string; customer: string; phone: string };
type CatItem = { label: string; price: number; partId?: string };
type Category = { id: string; name: string; charge: number; items: CatItem[] };

const engineOil: CatItem = { label: "Engine oil", price: 380, partId: "oil" };
const filterClean: CatItem = { label: "Filter cleaning", price: 120 };
const sparkPlug: CatItem = { label: "Spark plug", price: 150, partId: "plugs" };

const categories: Category[] = [
  { id: "reg", name: "Bike regular service", charge: 300, items: [engineOil, filterClean, sparkPlug, { label: "Chain lubrication", price: 80 }] },
  { id: "wash", name: "Bike regular service with wash", charge: 300, items: [{ label: "Wash", price: 100 }, engineOil, filterClean, sparkPlug] },
  { id: "brake", name: "Brake correction", charge: 300, items: [{ label: "Brake pad adjustment", price: 250 }, { label: "Brake fluid top-up", price: 180 }, { label: "Lining check", price: 150 }] },
  { id: "mirror", name: "Mirror attachment", charge: 150, items: [{ label: "Mirror", price: 120 }, { label: "Mounting bolts", price: 50 }] },
  { id: "engine", name: "Engine problem", charge: 300, items: [{ label: "Compression test", price: 250 }, { label: "Carburettor cleaning", price: 350 }, { label: "Valve clearance", price: 200 }, { label: "Gasket set", price: 160 }] },
  { id: "oil", name: "Oil change", charge: 100, items: [engineOil, { label: "Oil filter", price: 120, partId: "oilf" }] },
];

const catTotal = (c: Category) => c.items.reduce((s, i) => s + i.price, 0) + c.charge;
const stageLabel = (s: string) => tr(s === "Received" ? "QUEUED" : s === "In repair" ? "IN WORK" : s.toUpperCase());
const stageStep = (s: string) => (s === "Received" ? 0 : s === "In repair" ? 1 : 2);
const bestBrand = (p: Part) => [...p.brands].sort((a, b) => b.qty - a.qty)[0].brand;

const pillPrimary =
  "flex items-center justify-center gap-2 rounded-full bg-[#ff4d0a] text-sm font-extrabold text-white shadow-m2 transition hover:shadow-m3 hover:brightness-105 active:shadow-m1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] disabled:bg-[#e6dfda] disabled:text-[#6e6762] disabled:shadow-none disabled:brightness-100";
const pillSoft =
  "flex items-center justify-center gap-2 rounded-full bg-[#f4f0ed] text-sm font-extrabold shadow-m1 transition hover:bg-[#ebe5e1] hover:shadow-m2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] disabled:text-[#6e6762] disabled:shadow-none";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label={tr("Back")}
      onClick={onClick}
      className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f4f0ed] shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
    >
      <Icon name="chevron" className="size-5 rotate-180" />
    </button>
  );
}

function JobsTab({
  jobs, parts, addItems, addJob, setStage, markDone, notifyCustomer, notify,
}: {
  jobs: Job[];
  parts: Part[];
  addItems: (jobId: string, items: Omit<Item, "id" | "approved">[]) => void;
  addJob: (d: NewJob) => string;
  setStage: (jobId: string, stage: string) => void;
  markDone: (jobId: string, method: string) => void;
  notifyCustomer: (jobId: string) => void;
  notify: (m: string) => void;
}) {
  const [view, setView] = useState<JobsView>("list");
  const [selId, setSelId] = useState<string | null>(null);
  const [draftPlate, setDraftPlate] = useState("");
  const [pay, setPay] = useState("UPI");
  const active = jobs.filter((j) => !j.done);
  const cur = jobs.find((j) => j.id === selId);
  const toList = () => setView("list");
  const open = (id: string) => {
    setSelId(id);
    setView("detail");
  };

  if (view === "receipt" && cur?.done)
    return <Receipt d={jobReceipt(cur, true)} onBack={toList} backLabel="Back to jobs" />;

  if (view === "scan")
    return (
      <ScanView
        plates={[...active.map((j) => j.plate), "MH 12 KJ 5521"]}
        onBack={toList}
        onNext={(plate) => {
          const hit = jobs.find((j) => normPlate(j.plate) === normPlate(plate));
          if (hit && !hit.done) {
            notify(tr("Matched {plate} · {vehicle}", { plate: hit.plate, vehicle: hit.vehicle.split(" · ")[0] }));
            open(hit.id);
          } else if (hit) {
            notify(tr("{plate} is already billed", { plate: hit.plate }));
            toList();
          } else {
            setDraftPlate(plate);
            notify(tr("No job card for {plate}. Create work.", { plate }));
            setView("create");
          }
        }}
      />
    );

  if (view === "create")
    return (
      <CreateView
        plate={draftPlate}
        onBack={toList}
        onCreate={(d) => open(addJob(d))}
      />
    );

  if (view === "grid")
    return (
      <div className="flex h-full flex-col">
        <div className="shrink-0 px-6 pb-3"><BackButton onClick={toList} /></div>
        <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-3 overflow-y-auto px-6 pb-4">
          {jobs.map((j) => {
            const working = j.stage === "In repair";
            return (
              <button
                key={j.id}
                onClick={() => (j.done ? (setSelId(j.id), setView("receipt")) : open(j.id))}
                className="flex min-h-[148px] flex-col justify-between rounded-3xl bg-[#f4f0ed] p-4 text-left shadow-m1 transition hover:shadow-m2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] disabled:opacity-60 disabled:shadow-none"
              >
                <span>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${working ? "bg-[#ff4d0a] text-white" : "bg-white text-[#222]"}`}>
                    {tr(working ? "In work" : j.stage === "Received" ? "Queued" : j.stage)}
                  </span>
                  <span className="mt-2 block text-sm leading-5 font-extrabold tracking-wide">{j.plate}</span>
                  <span className="block truncate text-xs text-[#4a4542]">{j.vehicle.split(" · ")[0]}</span>
                </span>
                <span>
                  <span className="block text-[11px] text-[#6e6762]">{j.done ? tr("Billed") : tr("Ready {when}", { when: tr(j.ready) })}</span>
                  <span className="block text-xl leading-6 font-extrabold tracking-[-0.02em]">{inr(billTotal(j))}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );

  if (view === "add" && cur)
    return (
      <AddFlow
        job={cur}
        parts={parts}
        onBack={() => setView("detail")}
        onConfirm={(items) => {
          addItems(cur.id, items);
          setView("detail");
        }}
      />
    );

  if (view === "detail" && cur && !cur.done) {
    const pending = cur.items.some((i) => !i.approved);
    const step = stageStep(cur.stage);
    return (
      <div className="no-scrollbar h-full overflow-y-auto px-6 pb-6">
        <div className="mb-3"><BackButton onClick={toList} /></div>
        <div className="space-y-4">
          <BillCard job={cur} />
          <ProgressCard step={step} />

          <button onClick={() => setView("add")} className={`${pillSoft} h-14 w-full`}>
            <Icon name="plus" className="size-4" /> {tr("Add part or service")}
          </button>

          <button
            disabled={step === 2}
            onClick={() => setStage(cur.id, step === 0 ? "In repair" : "Ready")}
            className={`${pillPrimary} h-14 w-full`}
          >
            {tr(step === 0 ? "Start repair" : step === 1 ? "Ready" : "Ready for pickup")}
          </button>

          <div>
            <p className="mb-2 text-sm font-extrabold">{tr("Inform the customer")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => notify(tr("Calling {name}…", { name: cur.customer }))} className={`${pillSoft} h-12`}>
                <Icon name="phone" className="size-4" /> {tr("Call")}
              </button>
              <button disabled={cur.notified} onClick={() => notifyCustomer(cur.id)} className={`${pillSoft} h-12`}>
                <Icon name={cur.notified ? "check" : "send"} className="size-4" /> {tr(cur.notified ? "Notified" : "Notify")}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-extrabold">{tr("Payment received via")}</p>
            <Seg options={["UPI", "Cash"]} value={pay} onChange={setPay} />
          </div>

          <button
            disabled={pending}
            onClick={() => { markDone(cur.id, pay); setView("receipt"); }}
            className={`${pillPrimary} h-14 w-full`}
          >
            {pending ? tr("Waiting for customer approval") : tr("Mark as done · {amount}", { amount: inr(billTotal(cur)) })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 px-6 pb-5">
        <button onClick={() => setView("scan")} className={`${pillPrimary} h-14 flex-1 text-base`}>
          <Icon name="scan" className="size-5" /> {tr("Scan plate")}
        </button>
        <button
          aria-label={tr("New job")}
          onClick={() => { setDraftPlate(""); setView("create"); }}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-[#f4f0ed] shadow-m2 transition hover:shadow-m3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
        >
          <Icon name="plus" />
        </button>
        <button
          aria-label={tr("All jobs")}
          onClick={() => setView("grid")}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-[#f4f0ed] shadow-m2 transition hover:shadow-m3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
        >
          <Icon name="grid" />
        </button>
      </div>

      {active.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-[#6e6762]">{tr("All jobs are done. Scan a plate to start a new one.")}</p>
      ) : (
        <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pt-1 pb-12 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
          {active.map((j) => (
            <button
              key={j.id}
              onClick={() => open(j.id)}
              className="block w-full rounded-3xl border border-[#222] bg-[#f4f0ed] p-5 text-left shadow-m1 transition hover:shadow-m3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
            >
              <span className="flex items-start justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4d0a] px-3 py-1 text-[11px] font-medium text-white">
                  <span className="size-1.5 rounded-full bg-white" />
                  {stageLabel(j.stage)}
                </span>
                <span className="text-right text-xs text-[#4a4542]">
                  {tr("Ready by")}
                  <span className="block text-sm font-extrabold text-[#222]">{tr(j.ready)}</span>
                </span>
              </span>
              <span className="mt-3 block text-2xl leading-8 font-extrabold tracking-[0.01em]">{j.plate}</span>
              <span className="block text-sm text-[#4a4542]">{j.vehicle}</span>
              <span className="mt-4 flex items-end justify-between">
                <span className="text-sm font-semibold text-[#6e6762]">{tr("Estimate")}</span>
                <span className="text-2xl font-extrabold tracking-[-0.02em] text-[#ff4d0a]">{inr(billTotal(j))}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const normPlate = (v: string) => v.replace(/[^a-z0-9]/gi, "").toUpperCase();

function ScanView({ plates, onBack, onNext }: { plates: string[]; onBack: () => void; onNext: (plate: string) => void }) {
  const [read, setRead] = useState("");
  const [scanning, setScanning] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const cursor = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const scan = () => {
    setScanning(true);
    setRead("");
    timer.current = window.setTimeout(() => {
      setRead(plates[cursor.current++ % plates.length]);
      setScanning(false);
    }, 1400);
  };

  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="relative flex shrink-0 items-center justify-center pb-4">
        <div className="absolute left-0"><BackButton onClick={onBack} /></div>
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">{tr("Scan number plate")}</h2>
      </div>

      <div className="mx-auto mt-4 w-full max-w-[300px]">
        <div className="relative h-[200px] overflow-hidden rounded-3xl bg-[#222] shadow-m3">
          <div className="absolute inset-x-3 top-[68px] grid h-16 place-items-center rounded-xl border-2 border-[#ff4d0a]">
            <span className="text-lg font-extrabold tracking-widest text-white/85">{scanning ? tr("READING…") : read || "— — — —"}</span>
            {scanning && <span className="absolute inset-x-0 h-0.5 animate-[scanline_1.4s_ease-in-out_infinite] bg-[#ff4d0a]" />}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[#6e6762]">{tr("Align the plate inside the frame")}</p>
      </div>

      <div className="mt-auto space-y-3">
        <button onClick={scan} disabled={scanning} className={`${pillPrimary} h-14 w-full`}>
          <Icon name="scan" className="size-4" /> {scanning ? tr("Scanning…") : tr("Scan plate")}
        </button>
        <button onClick={() => onNext(read)} disabled={!read} className={`${pillPrimary} h-14 w-full`}>
          {tr("Next")}
        </button>
      </div>
    </div>
  );
}

function CreateView({ plate, onBack, onCreate }: { plate: string; onBack: () => void; onCreate: (d: NewJob) => void }) {
  const [v, setV] = useState({ plate, vehicle: "", customer: "", phone: "" });
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const fields: { key: keyof NewJob; ph: string; mode?: "tel" }[] = [
    { key: "plate", ph: "VEHICLE NUMBER" },
    { key: "vehicle", ph: "VEHICLE MODEL" },
    { key: "customer", ph: "NAME" },
    { key: "phone", ph: "NUMBER", mode: "tel" },
  ];
  const ready = v.plate.trim() && v.vehicle.trim() && v.customer.trim();

  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="shrink-0 pb-4"><BackButton onClick={onBack} /></div>
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={f.key} className="flex gap-2">
            <input
              ref={(el) => { refs.current[i] = el; }}
              value={v[f.key]}
              inputMode={f.mode}
              aria-label={tr(f.ph)}
              placeholder={tr(f.ph)}
              onChange={(e) => setV({ ...v, [f.key]: f.key === "plate" ? e.target.value.toUpperCase() : e.target.value })}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-[#222] bg-transparent px-4 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#6e6762] focus:shadow-m1 focus:ring-2 focus:ring-[#ff4d0a]"
            />
            <button onClick={() => refs.current[i]?.focus()} className={`${pillSoft} h-12 w-[72px] shrink-0`}>{tr("edit")}</button>
          </div>
        ))}
      </div>
      <button
        disabled={!ready}
        onClick={() => onCreate({ ...v, plate: v.plate.trim(), vehicle: v.vehicle.trim(), customer: v.customer.trim(), phone: v.phone.trim() })}
        className={`${pillPrimary} mt-auto h-14 w-full tracking-wide uppercase`}
      >
        {tr("Create work")}
      </button>
    </div>
  );
}

function ProgressCard({ step }: { step: number }) {
  const names = ["Received", "In repair", "Ready"];
  const node = (i: number) => {
    const done = i < step;
    const current = i === step;
    return (
      <div key={names[i]} className="flex w-16 shrink-0 flex-col items-center gap-2">
        {current ? (
          <span className="grid size-10 place-items-center rounded-full bg-[#ff4d0a] shadow-m2">
            <span className="size-3 rounded-full bg-white" />
          </span>
        ) : done ? (
          <span className="grid size-9 place-items-center rounded-full bg-[#ff4d0a] text-white">
            <Icon name="check" className="size-5" />
          </span>
        ) : (
          <span className="size-9 rounded-full bg-[#ddd6d1]" />
        )}
        {current ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff4d0a] px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-white">
            <span className="size-1.5 rounded-full bg-white" />
            {tr(names[i].toUpperCase())}
          </span>
        ) : (
          <span className={`text-[11px] font-medium ${done ? "text-[#222]" : "text-[#6e6762]"}`}>{tr(names[i])}</span>
        )}
      </div>
    );
  };
  const line = (on: boolean, k: string) => <span key={k} className={`mt-[18px] h-1 flex-1 rounded-full ${on ? "bg-[#ff4d0a]" : "bg-[#ddd6d1]"}`} />;
  return (
    <section className="rounded-3xl bg-[#f4f0ed] p-4 shadow-m1" aria-label={tr("Repair progress")}>
      <p className="text-sm font-extrabold">{tr("Repair Progress")}</p>
      <div className="mt-4 flex items-start justify-between">
        {node(0)}
        {line(step >= 1, "l1")}
        {node(1)}
        {line(step >= 2, "l2")}
        {node(2)}
      </div>
    </section>
  );
}

function BillCard({ job }: { job: Job }) {
  const services = job.items.filter((i) => i.kind === "service");
  const partItems = job.items.filter((i) => i.kind === "part");
  const row = (i: Item) => (
    <div key={i.id} className={`flex items-start justify-between gap-3 py-1.5 text-sm ${i.approved ? "" : "text-white/35"}`}>
      <span className="min-w-0">
        {tl(i.label)}
        {!i.approved && <span className="ml-2 rounded-full border border-white/25 px-2 py-0.5 text-[10px] font-medium text-white/60">{tr("Awaiting customer")}</span>}
      </span>
      <span className="shrink-0 font-extrabold">{inr(i.price)}</span>
    </div>
  );
  return (
    <section className="rounded-3xl bg-[#222] p-5 text-white shadow-m3">
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4d0a] px-3 py-1 text-xs font-medium text-white">
          <span className="size-1.5 rounded-full bg-white" />
          {stageLabel(job.stage)}
        </span>
        <div className="text-right">
          <p className="text-xs text-white/60">{tr("Ready by")}</p>
          <p className="text-sm font-extrabold">{tr(job.ready)}</p>
        </div>
      </div>
      <h2 className="mt-2 text-[28px] leading-9 font-extrabold tracking-[0.01em]">{job.plate}</h2>
      <p className="text-sm text-white/60">{job.vehicle}</p>
      <p className="text-sm text-white/60">{job.customer}</p>

      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-sm font-semibold text-white/55">{tr("Services")}</p>
        {services.length ? services.map(row) : <p className="py-1.5 text-sm text-white/35">{tr("No services yet")}</p>}
        <p className="mt-2 text-sm font-semibold text-white/55">{tr("Parts")}</p>
        {partItems.map(row)}
        {job.labour > 0 && (
          <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
            <span>{tr("Labour charges")}</span>
            <span className="shrink-0 font-extrabold">{inr(job.labour)}</span>
          </div>
        )}
        {partItems.length === 0 && job.labour === 0 && <p className="py-1.5 text-sm text-white/35">{tr("No parts yet")}</p>}
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
        <p className="text-sm font-semibold text-white/55">{tr("Estimate")}</p>
        <p className="text-[32px] leading-9 font-extrabold tracking-[-0.02em] text-white">{inr(billTotal(job))}</p>
      </div>
    </section>
  );
}

function Tick({ on, round, disabled }: { on: boolean; round?: boolean; disabled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-6 shrink-0 place-items-center border-2 ${round ? "rounded-full" : "rounded-md"} ${
        on ? "border-[#222] bg-[#222] text-white" : disabled ? "border-[#ddd6d1]" : "border-[#6e6762]"
      }`}
    >
      {on && <Icon name="check" className="size-4" />}
    </span>
  );
}

function AddFlow({
  job, parts, onBack, onConfirm,
}: {
  job: Job;
  parts: Part[];
  onBack: () => void;
  onConfirm: (items: Omit<Item, "id" | "approved">[]) => void;
}) {
  const [step, setStep] = useState<"cat" | "pkg" | "single">("cat");
  const [catId, setCatId] = useState<string | null>(null);
  const [left, setLeft] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const cat = categories.find((c) => c.id === catId);
  const first = job.customer.split(" ")[0];
  const stockOf = (id?: string) => {
    const p = parts.find((x) => x.id === id);
    return p ? total(p) : undefined;
  };
  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const head = (title: string, sub: string, back: () => void) => (
    <div className="flex shrink-0 items-start px-6 pb-3">
      <BackButton onClick={back} />
      <div className="min-w-0 flex-1 px-3 text-center">
        <h2 className="text-xl leading-7 font-extrabold tracking-[-0.02em]">{tr(title)}</h2>
        <p className="mt-1 text-xs text-[#6e6762]">{sub}</p>
      </div>
      <span className="size-12 shrink-0" />
    </div>
  );
  const note = <p className="mb-3 text-xs text-[#4a4542]">{tr("Goes to {name} on WhatsApp. The items stay greyed out on the bill until they approve.", { name: first })}</p>;
  const sub = tr("For {plate} · {vehicle}", { plate: job.plate, vehicle: job.vehicle.split(" · ")[0] });

  if (step === "cat")
    return (
      <div className="flex h-full flex-col">
        {head("Categories", tr("What is {plate} · {vehicle} here for?", { plate: job.plate, vehicle: job.vehicle.split(" · ")[0] }), onBack)}
        <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-6 pt-1 pb-3">
          {categories.map((c) => {
            const on = catId === c.id;
            return (
              <button
                key={c.id}
                aria-pressed={on}
                onClick={() => setCatId(c.id)}
                className={`flex w-full items-center gap-3 rounded-3xl border p-4 text-left shadow-m1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${
                  on ? "border-[#ff4d0a] bg-[#ffdbcf]" : "border-transparent bg-[#f4f0ed] hover:bg-[#ebe5e1]"
                }`}
              >
                <Tick on={on} round />
                <span className="min-w-0 flex-1">
                  <span className="block text-base leading-5 font-extrabold">{tr(c.name)}</span>
                  <span className="block text-xs text-[#4a4542]">{tr("{n} items + service charges", { n: c.items.length })}</span>
                </span>
                <span className="text-base font-extrabold">{inr(catTotal(c))}</span>
              </button>
            );
          })}
          <button
            aria-pressed={catId === "single"}
            onClick={() => setCatId("single")}
            className={`flex w-full items-center gap-3 rounded-3xl border p-4 text-left shadow-m1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${
              catId === "single" ? "border-[#ff4d0a] bg-[#ffdbcf]" : "border-transparent bg-[#f4f0ed] hover:bg-[#ebe5e1]"
            }`}
          >
            <Tick on={catId === "single"} round />
            <span className="min-w-0 flex-1">
              <span className="block text-base leading-5 font-extrabold">{tr("Single part from stock")}</span>
              <span className="block text-xs text-[#4a4542]">{tr("Pick one or more parts")}</span>
            </span>
          </button>
        </div>
        <div className="shrink-0 px-6 pt-2 pb-4">
          <button disabled={!catId} onClick={() => setStep(catId === "single" ? "single" : "pkg")} className={`${pillPrimary} h-14 w-full`}>
            {tr("Confirm")}
          </button>
        </div>
      </div>
    );

  if (step === "pkg" && cat) {
    const ticked = cat.items.filter((i) => !left.includes(i.label));
    const sum = ticked.reduce((s, i) => s + i.price, 0) + cat.charge;
    return (
      <div className="flex h-full flex-col">
        {head(cat.name, tr("{sub} · tap to leave an item out", { sub }), () => { setStep("cat"); setLeft([]); })}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-1">
          <div className="space-y-1">
            {cat.items.map((i) => {
              const on = !left.includes(i.label);
              const stock = stockOf(i.partId);
              return (
                <button
                  key={i.label}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(left, setLeft, i.label)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-[#222] ${on ? "" : "bg-[#f4f0ed] text-[#6e6762]"}`}
                >
                  <Tick on={on} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base leading-5">{tr(i.label)}</span>
                    {stock !== undefined && <span className="block text-[11px] text-[#6e6762]">{tr("{n} in stock", { n: stock })}</span>}
                  </span>
                  <span className={`text-base ${on ? "font-extrabold" : ""}`}>{inr(i.price)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 border-t border-black/10 px-4 pt-4">
            <div className="flex justify-between text-base"><span>{tr("Service charges")}</span><span className="font-extrabold">{inr(cat.charge)}</span></div>
            <div className="mt-3 flex items-end justify-between"><span className="text-sm font-extrabold">{tr("Total")}</span><span className="text-[28px] leading-8 font-extrabold tracking-[-0.02em]">{inr(sum)}</span></div>
          </div>
        </div>
        <div className="shrink-0 px-6 pt-3 pb-4">
          {note}
          <button
            disabled={ticked.length === 0}
            onClick={() =>
              onConfirm([
                ...ticked.map((i): Omit<Item, "id" | "approved"> => {
                  const p = parts.find((x) => x.id === i.partId);
                  return p
                    ? { label: `${i.label} · ${bestBrand(p)}`, kind: "part", price: i.price, partId: p.id, brand: bestBrand(p) }
                    : { label: i.label, kind: "service", price: i.price };
                }),
                { label: `Service charges · ${cat.name}`, kind: "service", price: cat.charge },
              ])
            }
            className={`${pillPrimary} h-14 w-full`}
          >
            {tr("Confirm · {amount}", { amount: inr(sum) })}
          </button>
        </div>
      </div>
    );
  }

  const chosen = parts.filter((p) => picked.includes(p.id));
  const sum = chosen.reduce((s, p) => s + p.price, 0);
  return (
    <div className="flex h-full flex-col">
      {head("Single part from stock", tr("{sub} · tick the parts you used", { sub }), () => setStep("cat"))}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-1">
        <div className="space-y-1">
          {parts.map((p) => {
            const on = picked.includes(p.id);
            const out = total(p) === 0;
            return (
              <button
                key={p.id}
                role="checkbox"
                aria-checked={on}
                disabled={out}
                onClick={() => toggle(picked, setPicked, p.id)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-[#222] disabled:text-[#6e6762]/60"
              >
                <Tick on={on} disabled={out} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base leading-5">{tr(p.name)}</span>
                  <span className="block text-[11px] text-[#6e6762]">{out ? tr("Out of stock") : tr("{n} in stock", { n: total(p) })}</span>
                </span>
                <span className={`text-base ${on ? "font-extrabold" : "text-[#4a4542]"}`}>{inr(p.price)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-end justify-between border-t border-black/10 px-4 pt-4 pb-3">
          <span className="text-sm font-extrabold">{tr("Total")}</span>
          <span className="text-[28px] leading-8 font-extrabold tracking-[-0.02em]">{inr(sum)}</span>
        </div>
      </div>
      <div className="shrink-0 px-6 pt-1 pb-4">
        {note}
        <button
          disabled={chosen.length === 0}
          onClick={() =>
            onConfirm(chosen.map((p) => ({ label: `${p.name.replace(/s$/, "")} · ${bestBrand(p)}`, kind: "part" as const, price: p.price, partId: p.id, brand: bestBrand(p) })))
          }
          className={`${pillPrimary} h-14 w-full`}
        >
          {tr("Confirm · {amount}", { amount: inr(sum) })}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- MY GARAGE ------------------------------- */

function GarageTab({
  parts, jobs, bills, mechanics, toggleOrder, addMechanic, markOrdered, receiveStock,
}: {
  markOrdered: (id: string) => void;
  receiveStock: (id: string, brand: string, qty: number) => void;
  parts: Part[];
  jobs: Job[];
  bills: Bill[];
  mechanics: Mechanic[];
  toggleOrder: (id: string) => void;
  addMechanic: (m: Mechanic) => void;
}) {
  const [anchor, setAnchor] = useState(TODAY);
  const [picked, setPicked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openBill, setOpenBill] = useState<Bill | null>(null);

  const loggedToday = bills.filter((b) => b.fresh);
  const todayIn = loggedToday.reduce((s, b) => s + b.total, 0);
  const wagesMonth = mechanics.reduce((s, m) => s + m.wage, 0);
  const toOrder = parts.filter((p) => p.toOrder);
  const ordered = parts.filter((p) => p.ordered);
  const restockDays = [10, 24];

  const dayData = (d: number) => {
    if (d === TODAY) return { earn: todayIn, jobs: loggedToday.length + jobs.filter((j) => !j.done).length };
    if (d > TODAY) return { earn: 0, jobs: 0 };
    return dailySeed[d] ?? { earn: 0, jobs: 0 };
  };
  const weekday = (d: number) => new Date(2026, 9, d).getDay();
  const monday = anchor - ((weekday(anchor) + 6) % 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => monday + i).filter((d) => d >= 1 && d <= 31);
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = (weekday(1) + 6) % 7;

  const scope = picked ? "day" : expanded ? "month" : "week";
  const range = scope === "day" ? [anchor] : scope === "week" ? weekDays : monthDays;
  const label = scope === "day" ? tr("{d} Oct", { d: anchor }) : scope === "week" ? tr("{a}–{b} Oct", { a: weekDays[0], b: weekDays[weekDays.length - 1] }) : tr("October 2026");
  const earned = range.reduce((s, d) => s + dayData(d).earn, 0);
  const jobCount = range.reduce((s, d) => s + dayData(d).jobs, 0);
  const share = range.filter((d) => d <= TODAY).length / TODAY;
  const partsCost = Math.round(PARTS_SPEND * (scope === "month" ? 1 : share * (TODAY / 31)) );
  const wages = Math.round(wagesMonth * (range.length / 31));
  const profit = earned - partsCost - wages;
  const rangeBills = bills.filter((b) => range.includes(b.day));
  const rangeRestock = range.filter((d) => restockDays.includes(d));

  const pick = (d: number) => { setAnchor(d); setPicked(true); };
  const shift = (n: number) => { setAnchor((a) => Math.min(31, Math.max(1, a + n))); setPicked(false); };

  const dayCell = (d: number, big: boolean) => {
    const sel = picked && d === anchor;
    const data = dayData(d);
    return (
      <button
        key={d}
        aria-label={`${d} October`}
        aria-pressed={sel}
        onClick={() => pick(d)}
        className={`flex flex-col items-center rounded-3xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${
          big ? "px-1 pt-2.5 pb-2" : "h-11 justify-center"
        } ${sel ? "border-transparent bg-[#222] text-white" : d === TODAY ? "border-transparent bg-[#ff4d0a] text-white" : "bg-[#f4f0ed] shadow-m1 hover:bg-[#ebe5e1]"} ${d > TODAY && !sel ? "text-[#6e6762]" : ""}`}
      >
        <span className={`${big ? "text-lg leading-6" : "text-sm"} font-extrabold`}>{d}</span>
        {big && <span className={`text-[11px] font-medium ${sel || d === TODAY ? "text-white/85" : "text-[#6e6762]"}`}>{tr(WEEKDAYS[weekday(d)])}</span>}
        <span className={`flex h-1.5 gap-1 ${big ? "mt-1.5" : "mt-0.5"}`}>
          {data.earn > 0 && <span className={`size-1.5 rounded-full ${sel ? "bg-white" : "bg-[#2e7d32]"}`} />}
          {restockDays.includes(d) && <span className="size-1.5 rounded-full bg-[#ff715b]" />}
        </span>
      </button>
    );
  };

  if (openBill)
    return (
      <Receipt
        d={{ plate: openBill.plate, vehicle: openBill.vehicle, rows: [[openBill.summary, openBill.total]], total: openBill.total, method: openBill.method, day: `${openBill.day} Oct 2026` }}
        onBack={() => setOpenBill(null)}
        backLabel="Back to My Garage"
      />
    );

  return (
    <div className="flex h-full flex-col px-6">
      <div className="shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setPicked(false)}
            className="text-left focus-visible:outline-2 focus-visible:outline-[#222]"
            aria-label={tr("Show whole range")}
          >
            <span className="block text-[11px] font-medium tracking-[0.08em] text-[#6e6762] uppercase">{tr(scope)}</span>
            <span className="block text-lg font-semibold tracking-[-0.02em]">{label}</span>
          </button>
          <div className="flex items-center gap-1">
            {!expanded && (
              <>
                <button aria-label={tr("Previous week")} onClick={() => shift(-7)} className="grid size-9 rotate-180 place-items-center rounded-full bg-[#f4f0ed] shadow-m1"><Icon name="chevron" className="size-4" /></button>
                <button aria-label={tr("Next week")} onClick={() => shift(7)} className="grid size-9 place-items-center rounded-full bg-[#f4f0ed] shadow-m1"><Icon name="chevron" className="size-4" /></button>
              </>
            )}
            <button
              aria-label={tr(expanded ? "Collapse to week" : "Expand to full month")}
              aria-expanded={expanded}
              onClick={() => { setExpanded(!expanded); setPicked(false); }}
              className="grid size-9 place-items-center rounded-full bg-[#222] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222]"
            >
              <Icon name="chevron" className={`size-4 transition ${expanded ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>
        </div>

        {expanded ? (
          <div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#6e6762]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{Array.from(tr(d))[0]}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
              {monthDays.map((d) => dayCell(d, false))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">{weekDays.map((d) => dayCell(d, true))}</div>
        )}
      </div>

      <div className="no-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pb-3">
        <section className="rounded-3xl bg-[#222] p-4 text-white shadow-m3">
          <p className="text-xs font-medium tracking-[0.08em] text-white/50 uppercase">{tr("Profit · {label}", { label })}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-white">{inr(profit)}</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            {([["In", inr(earned)], ["Parts", inr(partsCost)], ["Wages", inr(wages)], ["Jobs", String(jobCount)]] as const).map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-white/55">{tr(l)}</p>
                <p className="mt-0.5 text-[13px] font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">{tr("Bills & services")}</h2>
          {rangeBills.length === 0 ? (
            <p className="rounded-3xl bg-[#f4f0ed] shadow-m1 p-4 text-sm text-[#6e6762]">{tr("No bills logged for {label}.", { label })}</p>
          ) : (
            <div className="space-y-2">
              {rangeBills.map((b) => (
                <button key={b.id} onClick={() => setOpenBill(b)} className="flex w-full items-center gap-3 rounded-3xl bg-[#f4f0ed] p-3 text-left shadow-m1 transition hover:bg-[#ebe5e1] focus-visible:outline-2 focus-visible:outline-[#222]">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e6dfda]"><Icon name="wrench" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{b.plate}</span>
                    <span className="block truncate text-xs text-[#6e6762]">{b.vehicle} · {tl(b.summary)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{inr(b.total)}</span>
                    <span className="block text-[11px] text-[#6e6762]">{tr("{day} Oct · {method}", { day: b.day, method: tr(b.method) })}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-[#f4f0ed] shadow-m1 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{tr("Restock")}</h2>
            <span className="text-xs text-[#6e6762]">{rangeRestock.length ? tr("Due {days} Oct", { days: rangeRestock.join(", ") }) : tr("No restock day")}</span>
          </div>
          {toOrder.length === 0 && ordered.length === 0 ? (
            <p className="mt-2 text-sm text-[#6e6762]">{tr("Nothing marked. Low: {list}.", { list: parts.filter((p) => total(p) <= p.reorder).map((p) => tr(p.name)).slice(0, 3).join(", ") })}</p>
          ) : (
            toOrder.map((p) => (
              <div key={p.id} className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
                <span className="text-sm"><span className="font-semibold">{tr(p.name)}</span> <span className="text-[#6e6762]">· {tr("{n} left", { n: total(p) })}</span></span>
                <button onClick={() => markOrdered(p.id)} className={`${pillSoft} h-9 px-4 text-xs`}>{tr("Mark ordered")}</button>
              </div>
            ))
          )}
          {ordered.map((p) => (
            <div key={p.id} className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
              <span className="text-sm"><span className="font-semibold">{tr(p.name)}</span> <span className="text-[#6e6762]">{tr("· awaiting delivery")}</span></span>
              <button
                onClick={() => receiveStock(p.id, [...p.brands].sort((a, b) => b.qty - a.qty)[0].brand, p.reorder)}
                className={`${pillPrimary} h-9 px-4 text-xs`}
              >
                {tr("Received")}
              </button>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">{tr("Team")}</h2>
          <TeamList mechanics={mechanics} jobs={jobs} addMechanic={addMechanic} />
        </section>
      </div>
    </div>
  );
}

function TeamList({ mechanics, jobs, addMechanic }: { mechanics: Mechanic[]; jobs: Job[]; addMechanic: (m: Mechanic) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const submit = () => {
    if (!name.trim()) return;
    addMechanic({ id: `m${Date.now()}`, name: name.trim(), role: "Mechanic", wage: 12000, status: "Free" });
    setName("");
    setAdding(false);
  };
  return (
    <div className="space-y-2">
      {mechanics.map((m) => {
        const j = jobs.find((x) => x.mechanic === m.name && !x.done);
        return (
          <div key={m.id} className="flex items-center gap-3 rounded-3xl bg-[#f4f0ed] shadow-m1 p-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#e6dfda] text-base font-extrabold">{m.name[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{m.name}</span>
              <span className="block truncate text-xs text-[#6e6762]">{tr(m.role)} · {j ? j.plate : tr("No job")}</span>
            </span>
            <span className="text-right">
              <span className="block text-sm font-semibold">{inr(m.wage)}</span>
              <span className={`block text-[11px] font-medium ${j ? "text-[#2e7d32]" : "text-[#6e6762]"}`}>{tr(j ? "On job" : "Free")}</span>
            </span>
          </div>
        );
      })}
      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={tr("Mechanic name")}
            className="h-12 min-w-0 flex-1 rounded-full bg-[#f4f0ed] shadow-m1 px-4 text-sm outline-none focus:border-[#222]"
          />
          <button onClick={submit} className="h-12 rounded-full bg-[#222] px-5 text-sm font-semibold text-white">{tr("Add")}</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-dashed border-black/25 text-sm font-semibold transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#222]"
        >
          <Icon name="users" className="size-4" /> {tr("Add mechanic")}
        </button>
      )}
    </div>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function LanguageView({ onBack }: { onBack: () => void }) {
  const lang = useLang();
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-6 pb-6">
      <BackButton onClick={onBack} />
      <h2 className="mt-3 text-[22px] leading-7 font-semibold tracking-[-0.03em]">{tr("Language")}</h2>
      <p className="mt-1 text-sm text-[#6e6762]">{tr("Choose the app language")}</p>
      <div role="radiogroup" aria-label={tr("Language")} className="mt-5 grid gap-3">
        {LANGS.map((l) => {
          const on = l.code === lang;
          return (
            <button
              key={l.code}
              role="radio"
              aria-checked={on}
              onClick={() => setLang(l.code)}
              className={`flex h-16 items-center justify-between rounded-3xl px-5 text-left shadow-m1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222] ${on ? "bg-[#222] text-white" : "bg-[#f4f0ed] hover:bg-[#ebe5e1]"}`}
            >
              <span>
                <span className="block text-lg font-semibold">{l.native}</span>
                <span className={`block text-xs font-medium ${on ? "text-white/70" : "text-[#6e6762]"}`}>{l.english}</span>
              </span>
              {on && <Icon name="check" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

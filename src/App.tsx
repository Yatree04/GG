import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "bell"
  | "box"
  | "calendar"
  | "check"
  | "chevron"
  | "garage"
  | "grid"
  | "phone"
  | "plus"
  | "search"
  | "scan"
  | "send"
  | "sliders"
  | "users"
  | "wrench";

function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
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
    mechanic: "Imran", stage: "Done", ready: "Delivered", labour: 600, tool: 100, done: true, notified: true,
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
    <div className="grid rounded-full bg-[#f4f0ed] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`h-10 rounded-full text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-[#222222] ${
            value === o ? "bg-white text-[#222222] shadow-sm" : "text-[#4a4542] hover:text-[#222222]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [nav, setNav] = useState<"Stock" | "Jobs" | "My Garage">("Jobs");
  const [parts, setParts] = useState(initialParts);
  const [jobs, setJobs] = useState(initialJobs);
  const [bills, setBills] = useState(initialBills);
  const [mechanics, setMechanics] = useState(mechanicsSeed);
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
    notify(p.toOrder ? `${p.name} removed from order list` : `${p.name} added to My Garage orders`);
  };

  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  /** Customer said yes on WhatsApp: the items count on the bill and parts leave the shelf. */
  const approveMany = (jobId: string, ids: string[], what: string) => {
    const items = jobsRef.current.find((j) => j.id === jobId)?.items.filter((i) => ids.includes(i.id) && !i.approved) ?? [];
    if (!items.length) return;
    setJobs((js) => js.map((j) => (j.id !== jobId ? j : { ...j, items: j.items.map((i) => (ids.includes(i.id) ? { ...i, approved: true } : i)) })));
    setParts((ps) => ps.map((p) => {
      const used = items.filter((i) => i.partId === p.id);
      if (!used.length) return p;
      return { ...p, brands: p.brands.map((b) => ({ ...b, qty: Math.max(0, b.qty - used.filter((i) => i.brand === b.brand).length) })) };
    }));
    notify(`Customer approved ${what}`);
  };

  /** Add a package (or single parts) to a job; the customer approves it once on WhatsApp. */
  const addItems = (jobId: string, items: Omit<Item, "id" | "approved">[], what: string) => {
    const stamp = Date.now();
    const added = items.map((it, k) => ({ ...it, id: `n${stamp}-${k}`, approved: false }));
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, items: [...j.items, ...added] } : j)));
    notify(`${what} sent to customer for approval`);
    window.setTimeout(() => approveMany(jobId, added.map((i) => i.id), what), 5000);
  };

  const markDone = (jobId: string, method: string) => {
    const j = jobs.find((x) => x.id === jobId);
    if (!j) return;
    setJobs((js) => js.map((x) => (x.id === jobId ? { ...x, done: true, stage: "Done", ready: "Delivered" } : x)));
    setBills((b) => [
      {
        id: `b${Date.now()}`, plate: j.plate, vehicle: j.vehicle.split(" · ")[0], total: billTotal(j), method, day: TODAY, fresh: true,
        summary: j.items.filter((i) => i.approved).slice(0, 2).map((i) => i.label.split(" · ")[0]).join(", "),
      },
      ...b,
    ]);
    notify(`Bill ${inr(billTotal(j))} logged to My Garage`);
  };

  const notifyCustomer = (jobId: string) => {
    setJobs((js) => js.map((x) => (x.id === jobId ? { ...x, notified: true } : x)));
    notify("Customer notified on WhatsApp");
  };

  const navItems: { label: typeof nav; icon: IconName }[] = [
    { label: "Stock", icon: "box" },
    { label: "Jobs", icon: "wrench" },
    { label: "My Garage", icon: "garage" },
  ];

  return (
    <main className="min-h-dvh bg-[#ff4d0a] text-[#1f1f1f] frame:px-4 min-[400px]:px-6 frame:py-8">
      <div className="mx-auto w-full max-w-[560px] overflow-hidden bg-[#ffffff] shadow-[0_24px_80px_rgba(20,30,26,0.14)] frame:max-w-[430px] frame:rounded-[40px] frame:border frame:border-black/10">
        <div className="relative flex h-dvh flex-col frame:h-[min(860px,calc(100dvh-4rem-2px))]">
          <header className="shrink-0 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 min-[400px]:px-4 min-[400px]:px-6 frame:pt-8 frame:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="display mt-1 text-[#222222] text-[28px] leading-9 tracking-[-0.02em]">Sharma Motors</h1>
              </div>
              <button
                aria-label="Notifications"
                className="relative grid size-12 place-items-center rounded-full bg-[#f4f0ed] text-[#222222] transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
                onClick={() => notify(`${parts.filter((p) => total(p) <= p.reorder).length} parts are low on stock`)}
              >
                <Icon name="bell" />
                <span className="absolute top-3 right-3 size-2 rounded-full bg-[#ff4d0a] ring-2 ring-white" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1">
            {nav === "Stock" && <StockTab parts={parts} toggleOrder={toggleOrder} />}
            {nav === "Jobs" && (
              <JobsTab jobs={jobs} parts={parts} addItems={addItems} markDone={markDone} notifyCustomer={notifyCustomer} notify={notify} />
            )}
            {nav === "My Garage" && (
              <GarageTab
                parts={parts} jobs={jobs} bills={bills} mechanics={mechanics}
                toggleOrder={toggleOrder}
                addMechanic={(m) => { setMechanics((x) => [...x, m]); notify(`${m.name} added to your team`); }}
              />
            )}
          </div>

          <nav aria-label="Primary navigation" className="shrink-0 border-t border-black/10 bg-[#ffffff] px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-3">
              {navItems.map(({ label, icon }) => {
                const active = nav === label;
                const orders = label === "My Garage" ? parts.filter((p) => p.toOrder).length : 0;
                return (
                  <button
                    key={label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setNav(label)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#222222] ${
                      active ? "text-[#222222]" : "text-[#6e6762] hover:text-[#222222]"
                    }`}
                  >
                    <span className={`relative grid h-8 w-16 place-items-center rounded-full transition ${active ? "bg-[#ff4d0a]" : ""}`}>
                      <Icon name={icon} />
                      {orders > 0 && (
                        <span className="absolute -top-1 right-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#222222] px-1 text-[11px] leading-none font-semibold text-white">
                          {orders}
                        </span>
                      )}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div
            aria-live="polite"
            className={`pointer-events-none absolute right-6 bottom-24 left-6 z-20 rounded-[10px] bg-[#222222] px-4 py-3 text-center text-sm font-medium text-white shadow-xl transition-all ${
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

function StockTab({ parts, toggleOrder }: { parts: Part[]; toggleOrder: (id: string) => void }) {
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

  return (
    <div className="flex h-full flex-col px-4 min-[400px]:px-6">
      <label className="relative flex h-12 shrink-0 items-center rounded-full border border-transparent bg-[#f4f0ed] pr-4 pl-4 focus-within:border-[#222222]">
        <span className="sr-only">Search parts</span>
        <Icon name="search" className="size-6 shrink-0 text-[#4a4542]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pistons, brake pads, Bosch…"
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
              className={`flex h-24 min-[400px]:h-[108px] flex-col justify-between rounded-3xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] ${
                active ? "border-transparent bg-[#ff4d0a]" : "border-transparent bg-[#f4f0ed] hover:bg-[#ebe4df]"
              }`}
            >
              <span className="flex items-start justify-between">
                <span className={`grid size-10 place-items-center rounded-full ${active ? "bg-[#222222]/10" : "bg-white text-[#222222]"}`}>
                  <Icon name={t.icon} className="size-6" />
                </span>
                <span className={`grid size-10 place-items-center rounded-full ${active ? "bg-[#222222] text-[#ff4d0a]" : "bg-[#222222] text-white"}`}>
                  <Icon name="arrow" className="size-[18px]" />
                </span>
              </span>
              <span>
                <span className={`block text-xs font-semibold ${active ? "text-[#222222]" : "text-[#4a4542]"}`}>{t.label}</span>
                <span className="block text-2xl leading-7 font-bold tracking-[-0.03em]">{t.value}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex shrink-0 items-baseline justify-between">
        <h2 className="text-[22px] leading-7 font-semibold tracking-[-0.01em]">Stock overview</h2>
      </div>

      <div className="no-scrollbar mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pb-3">
        {list.length === 0 && <p className="py-8 text-center text-sm text-[#6e6762]">Nothing here{q ? ` for “${q}”` : ""}.</p>}
        {list.map((p) => {
          const t = total(p);
          const isLow = t <= p.reorder;
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="rounded-2xl bg-[#f4f0ed]">
              <button
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.id)}
                className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-[#222222]"
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-full text-base font-bold ${isLow ? "bg-[#ffd9c9]" : "bg-white"}`}>
                  {t}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-[#6e6762]">
                    {p.brands.length} brand{p.brands.length > 1 ? "s" : ""} · {isLow ? `low, reorder at ${p.reorder}` : inr(p.price) + " each"}
                  </span>
                </span>
                {p.toOrder && <span className="rounded-full bg-[#ff4d0a] px-2 py-1 text-[11px] font-bold">TO ORDER</span>}
                <Icon name="chevron" className={`size-6 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-black/10 px-3 pt-2 pb-3">
                  {p.brands.map((b) => (
                    <div key={b.brand} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-[#4a4542]">{b.brand}</span>
                      <span className="font-semibold">{b.qty}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => toggleOrder(p.id)}
                    className={`mt-2 h-12 w-full rounded-full text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] ${
                      p.toOrder ? "bg-white text-[#222222] hover:bg-[#faf7f5]" : "bg-[#ff4d0a] text-[#222222] hover:bg-[#ff6a2e]"
                    }`}
                  >
                    {p.toOrder ? "Remove from order list" : "Mark to order"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------- JOBS --------------------------------- */

function JobsTab({
  jobs, parts, addItems, markDone, notifyCustomer, notify,
}: {
  jobs: Job[];
  parts: Part[];
  addItems: (jobId: string, items: Omit<Item, "id" | "approved">[], what: string) => void;
  markDone: (jobId: string, method: string) => void;
  notifyCustomer: (jobId: string) => void;
  notify: (m: string) => void;
}) {
  const [mini, setMini] = useState(false);
  const [scan, setScan] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [pay, setPay] = useState("UPI");
  const track = useRef<HTMLDivElement>(null);
  const active = jobs.filter((j) => !j.done);
  const cur = active[Math.min(idx, active.length - 1)];

  useEffect(() => {
    const el = track.current;
    if (el && !mini) el.scrollTo({ left: idx * el.clientWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mini, active.length]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-end gap-2 px-4 min-[400px]:px-6">
        <button
          onClick={() => setScan(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-[#ff4d0a] px-5 text-sm font-semibold text-[#222222] transition hover:bg-[#ff6a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
        >
          <Icon name="scan" className="size-[18px]" /> Scan plate
        </button>
        <button
          aria-label={mini ? "Show card stack" : "Minimise to overview"}
          aria-pressed={mini}
          onClick={() => setMini(!mini)}
          className="grid size-12 place-items-center rounded-full bg-[#f4f0ed] text-[#222222] transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
        >
          <Icon name={mini ? "wrench" : "grid"} className="size-[18px]" />
        </button>
      </div>

      {mini ? (
        <MiniGrid
          jobs={jobs}
          onOpen={(j) => {
            setIdx(Math.max(0, active.findIndex((a) => a.id === j.id)));
            setMini(false);
          }}
        />
      ) : active.length === 0 ? (
        <p className="px-4 min-[400px]:px-6 py-16 text-center text-sm text-[#6e6762]">All jobs are done. New tickets appear here.</p>
      ) : (
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
          <div
            ref={track}
            onScroll={(e) => {
              const el = e.currentTarget;
              setIdx(Math.round(el.scrollLeft / el.clientWidth));
            }}
            className="no-scrollbar flex snap-x snap-mandatory items-start overflow-x-auto"
          >
            {active.map((j) => (
              <div key={j.id} className="w-full shrink-0 snap-center px-4 min-[400px]:px-6">
                <BillCard job={j} />
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {active.map((j, i) => (
              <span key={j.id} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[#222222]" : "w-1.5 bg-black/20"}`} />
            ))}
          </div>

          {cur && (
            <div className="space-y-4 px-4 min-[400px]:px-6 pt-4">
              <button
                onClick={() => setSheet(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4f0ed] text-[#222222] text-sm font-semibold transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
              >
                <Icon name="plus" className="size-[18px]" /> Add part or service
              </button>

              <div className="space-y-1 px-1 text-sm text-[#6e6762]">
                <div className="flex justify-between"><span>Labour charges</span><span>{inr(cur.labour)}</span></div>
                <div className="flex justify-between"><span>Tool charges</span><span>{inr(cur.tool)}</span></div>
              </div>

              <section className="rounded-2xl bg-[#f4f0ed] p-4">
                <p className="text-sm font-semibold text-[#4a4542]">Customer</p>
                <p className="mt-1 font-semibold">{cur.customer}</p>
                <p className="text-sm text-[#6e6762]">{cur.phone} · Mechanic {cur.mechanic}</p>
              </section>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => notify(`Calling ${cur.customer}…`)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#f4f0ed] text-[#222222] text-sm font-semibold transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-[#222222]"
                >
                  <Icon name="phone" className="size-[18px]" /> Call
                </button>
                <button
                  disabled={cur.notified}
                  onClick={() => notifyCustomer(cur.id)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#f4f0ed] text-[#222222] text-sm font-semibold transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-[#222222] disabled:text-[#6e6762]"
                >
                  <Icon name={cur.notified ? "check" : "send"} className="size-[18px]" /> {cur.notified ? "Notified" : "Notify (optional)"}
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#4a4542]">Payment received via</p>
                <Seg options={["UPI", "Cash"]} value={pay} onChange={setPay} />
              </div>
              <button
                disabled={cur.items.some((i) => !i.approved)}
                onClick={() => { markDone(cur.id, pay); setIdx(0); }}
                className="h-14 w-full rounded-full bg-[#ff4d0a] text-sm font-bold text-[#222222] transition hover:bg-[#ff6a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] disabled:bg-black/10 disabled:text-[#6e6762]"
              >
                {cur.items.some((i) => !i.approved) ? "Waiting for customer approval" : `Mark as done · ${inr(billTotal(cur))}`}
              </button>
            </div>
          )}
        </div>
      )}

      {scan && (
        <ScanSheet
          jobs={jobs}
          onClose={() => setScan(false)}
          onMatch={(j) => {
            setScan(false);
            if (j.done) return notify(`${j.plate} is already billed`);
            setIdx(Math.max(0, active.findIndex((a) => a.id === j.id)));
            setMini(false);
            notify(`Matched ${j.plate} · ${j.vehicle.split(" · ")[0]}`);
          }}
        />
      )}

      {sheet && cur && (
        <ServiceFlow
          job={cur}
          parts={parts}
          onClose={() => setSheet(false)}
          onConfirm={(items, what) => { addItems(cur.id, items, what); setSheet(false); }}
        />
      )}
    </div>
  );
}

const normPlate = (v: string) => v.replace(/[^a-z0-9]/gi, "").toUpperCase();

function ScanSheet({ jobs, onClose, onMatch }: { jobs: Job[]; onClose: () => void; onMatch: (j: Job) => void }) {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const cursor = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const lookup = (raw: string) => {
    const n = normPlate(raw);
    const hit = n && jobs.find((j) => normPlate(j.plate) === n);
    if (hit) onMatch(hit);
    else setError(n ? `No job card found for ${raw.toUpperCase()}` : "Enter a number plate first");
  };

  const scan = () => {
    setError("");
    setScanning(true);
    timer.current = window.setTimeout(() => {
      const pool = jobs.filter((j) => !j.done);
      const read = pool[cursor.current++ % Math.max(1, pool.length)]?.plate ?? "";
      setScanning(false);
      setText(read);
      lookup(read);
    }, 1400);
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="rounded-t-3xl bg-[#ffffff] p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Scan number plate">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[22px] leading-7 font-semibold">Scan number plate</h3>
          <button onClick={onClose} className="h-12 rounded-full px-3 text-sm font-semibold underline underline-offset-4">Close</button>
        </div>

        <div className="relative grid h-40 place-items-center overflow-hidden rounded-2xl bg-[#222222]">
          <div className="relative grid h-16 w-64 place-items-center rounded-lg border-2 border-[#ff4d0a]">
            <span className="text-[22px] font-bold tracking-widest text-white/90">{scanning ? "READING…" : text || "— — — —"}</span>
            {scanning && <span className="absolute inset-x-0 h-0.5 animate-[scanline_1.4s_ease-in-out_infinite] bg-[#ff4d0a]" />}
          </div>
          <p className="absolute bottom-2 text-[11px] text-white/65">Align the plate inside the frame</p>
        </div>

        <button
          onClick={scan}
          disabled={scanning}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff4d0a] text-sm font-bold text-[#222222] transition hover:bg-[#ff6a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] disabled:opacity-60"
        >
          <Icon name="scan" className="size-[18px]" /> {scanning ? "Scanning…" : "Scan plate"}
        </button>

        <div className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && lookup(text)}
            placeholder="or type MH 12 QR 4821"
            aria-label="Number plate"
            className="h-12 min-w-0 flex-1 rounded-[10px] border border-[#8a837e] bg-white px-4 text-sm font-semibold tracking-wide uppercase outline-none placeholder:font-medium placeholder:tracking-normal placeholder:normal-case focus:border-[#222222]"
          />
          <button onClick={() => lookup(text)} className="h-12 rounded-full bg-[#f4f0ed] text-[#222222] px-4 text-sm font-semibold hover:bg-[#ebe4df]">Match</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-[#c2200d]">{error}</p>}
      </div>
    </div>
  );
}

function MiniGrid({ jobs, onOpen }: { jobs: Job[]; onOpen: (j: Job) => void }) {
  return (
    <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2 overflow-y-auto px-4 min-[400px]:px-6 pb-3">
      {jobs.map((j) => (
        <button
          key={j.id}
          disabled={j.done}
          onClick={() => onOpen(j)}
          className={`flex min-h-[148px] flex-col justify-between rounded-3xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] ${
            j.done ? "border-transparent bg-[#f4f0ed] text-[#4a4542]" : j.stage === "In work" ? "border-transparent bg-[#222222] text-white" : "border-transparent bg-[#f4f0ed] hover:bg-[#ebe4df]"
          }`}
        >
          <span>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${j.stage === "In work" ? "bg-[#ff4d0a] text-[#222222]" : "bg-white text-[#4a4542]"}`}>{j.stage}</span>
            <span className="mt-2 block text-sm leading-5 font-bold tracking-wide">{j.plate}</span>
            <span className="block truncate text-xs opacity-75">{j.vehicle.split(" · ")[0]}</span>
          </span>
          <span>
            <span className="block text-[11px] opacity-75">{j.done ? "Billed" : `Ready ${j.ready}`}</span>
            <span className="block text-[22px] leading-7 font-bold tracking-[-0.02em]">{inr(billTotal(j))}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function BillCard({ job }: { job: Job }) {
  const services = job.items.filter((i) => i.kind === "service");
  const partItems = job.items.filter((i) => i.kind === "part");
  const row = (i: Item) => (
    <div key={i.id} className={`flex items-start justify-between gap-3 py-1.5 text-sm ${i.approved ? "" : "text-white/60"}`}>
      <span className="min-w-0">
        {i.label}
        {!i.approved && <span className="ml-2 rounded-full border border-white/40 px-2 py-0.5 text-[11px] font-semibold text-white/75">Awaiting customer</span>}
      </span>
      <span className="shrink-0 font-semibold">{inr(i.price)}</span>
    </div>
  );
  return (
    <section className="rounded-3xl bg-[#222222] p-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4d0a] px-3 py-1 text-xs font-bold text-[#222222]">
            <span className="size-1.5 rounded-full bg-[#222222]" />
            {job.stage.toUpperCase()}
          </span>
          <h2 className="display mt-3 text-[28px] leading-9 tracking-[0.01em]">{job.plate}</h2>
          <p className="mt-0.5 text-sm text-white/60">{job.vehicle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/65">Ready by</p>
          <p className="mt-0.5 text-sm font-semibold">{job.ready}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-3">
        <p className="text-sm font-semibold text-white/60">Services</p>
        {services.length ? services.map(row) : <p className="py-1.5 text-sm text-white/60">No services yet</p>}
        <p className="mt-3 text-sm font-semibold text-white/60">Parts</p>
        {partItems.length ? partItems.map(row) : <p className="py-1.5 text-sm text-white/60">No parts yet</p>}
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
        <p className="text-sm font-semibold text-white/60">Estimate</p>
        <p className="display text-[28px] leading-9 tracking-[-0.02em] text-[#ff4d0a]">{inr(billTotal(job))}</p>
      </div>
    </section>
  );
}

/* --------------------------- SERVICE CATEGORIES ---------------------------
   From the team's Figma file (Autoooo, Frames 19 and 20):
   1. Categories: pick what the vehicle came in for, then Confirm.
   2. The package: what that service includes, each with its price, then service
      charges and the total, then Confirm. Items can be ticked in or out. */

type PkgLine = { label: string; price: number; partId?: string };
type Pkg = { id: string; name: string; lines: PkgLine[]; service: number; startEmpty?: boolean };

const CATEGORIES: Pkg[] = [
  { id: "reg", name: "Bike regular service", service: 300, lines: [
    { label: "Engine oil", price: 380, partId: "oil" }, { label: "Filter cleaning", price: 120 },
    { label: "Spark plug", price: 150, partId: "plugs" }, { label: "Chain lubrication", price: 80 } ] },
  { id: "wash", name: "Bike regular service with wash", service: 300, lines: [
    { label: "Wash", price: 100 }, { label: "Engine oil", price: 380, partId: "oil" },
    { label: "Filter cleaning", price: 120 }, { label: "Spark plug", price: 150, partId: "plugs" } ] },
  { id: "brake", name: "Brake correction", service: 100, lines: [
    { label: "Brake adjustment", price: 150 }, { label: "Brake pads", price: 450, partId: "pads" }, { label: "Brake cable", price: 180 } ] },
  { id: "mirror", name: "Mirror attachment", service: 50, lines: [{ label: "Side mirror", price: 220 }, { label: "Fitting", price: 50 }] },
  { id: "engine", name: "Engine problem", service: 400, lines: [
    { label: "Engine inspection", price: 200 }, { label: "Spark plug", price: 150, partId: "plugs" },
    { label: "Carburettor cleaning", price: 350 }, { label: "Air filter", price: 160 } ] },
  { id: "oilc", name: "Oil change", service: 100, lines: [{ label: "Engine oil", price: 380, partId: "oil" }, { label: "Oil filter", price: 120, partId: "oilf" }] },
];

const pkgTotal = (c: Pkg) => c.lines.reduce((s, l) => s + l.price, 0) + c.service;

function ScreenBar({ title, sub, onBack, backLabel }: { title: string; sub: string; onBack: () => void; backLabel: string }) {
  return (
    <div className="grid shrink-0 grid-cols-[48px_1fr_48px] items-start gap-2 px-4 pt-2 pb-4 min-[400px]:px-6">
      <button onClick={onBack} aria-label={backLabel} className="grid size-12 place-items-center rounded-full bg-[#f4f0ed] text-[#222222] transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]">
        <Icon name="chevron" className="size-6 rotate-180" />
      </button>
      <div className="pt-1 text-center">
        <h3 className="display text-[22px] leading-7 text-[#222222] [text-wrap:balance]">{title}</h3>
        <p className="mt-1 text-xs text-[#6e6762]">{sub}</p>
      </div>
      <span />
    </div>
  );
}

function ServiceFlow({
  job, parts, onClose, onConfirm,
}: {
  job: Job;
  parts: Part[];
  onClose: () => void;
  onConfirm: (items: Omit<Item, "id" | "approved">[], what: string) => void;
}) {
  const [step, setStep] = useState<"categories" | "package">("categories");
  const [catId, setCatId] = useState<string | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const forJob = `${job.plate} · ${job.vehicle.split(" · ")[0]}`;

  // "Single part from stock": every part on the shelf, nothing ticked yet, no service charge.
  const single: Pkg = { id: "single", name: "Single part from stock", service: 0, startEmpty: true, lines: parts.map((p) => ({ label: p.name, price: p.price, partId: p.id })) };
  const cat = catId === "single" ? single : CATEGORIES.find((c) => c.id === catId) ?? null;

  const stockOf = (partId?: string) => (partId ? parts.find((p) => p.id === partId) : undefined);
  const outOf = (l: PkgLine) => { const p = stockOf(l.partId); return !!p && total(p) === 0; };
  const key = (l: PkgLine, i: number) => `${i}:${l.label}`;
  const included = (l: PkgLine, i: number) => !outOf(l) && !off.has(key(l, i));

  const openPackage = () => {
    if (!cat) return;
    // A package starts with everything ticked; a single part starts with nothing ticked.
    setOff(new Set(cat.startEmpty ? cat.lines.map(key) : []));
    setStep("package");
  };
  const toggle = (l: PkgLine, i: number) => setOff((s) => { const n = new Set(s); const k = key(l, i); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const chosen = cat ? cat.lines.filter(included) : [];
  const sum = chosen.reduce((s, l) => s + l.price, 0) + (cat && chosen.length ? cat.service : 0);

  const confirm = () => {
    if (!cat || !chosen.length) return;
    const items: Omit<Item, "id" | "approved">[] = chosen.map((l) => {
      const p = stockOf(l.partId);
      if (!p) return { label: l.label, kind: "service", price: l.price };
      const best = [...p.brands].sort((a, b) => b.qty - a.qty)[0];
      return { label: `${l.label} · ${best.brand}`, kind: "part", price: l.price, partId: p.id, brand: best.brand };
    });
    if (cat.service) items.push({ label: `Service charges · ${cat.name}`, kind: "service", price: cat.service });
    onConfirm(items, cat.id === "single" ? (chosen.length === 1 ? chosen[0].label : `${chosen.length} parts`) : cat.name);
  };

  const row = "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]";
  const confirmBtn = "flex h-14 w-full items-center justify-center rounded-full bg-[#ff4d0a] text-base font-bold text-[#222222] transition hover:bg-[#ff6a2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] disabled:bg-[#f4f0ed] disabled:text-[#6e6762]";

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white" role="dialog" aria-label={step === "categories" ? "Categories" : cat?.name}>
      {step === "categories" ? (
        <>
          <ScreenBar title="Categories" sub={`What is ${forJob} here for?`} onBack={onClose} backLabel="Back to the job" />
          <div role="radiogroup" aria-label="Service category" className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4 min-[400px]:px-6">
            {[...CATEGORIES, single].map((c) => {
              const sel = catId === c.id;
              return (
                <button key={c.id} role="radio" aria-checked={sel} onClick={() => setCatId(c.id)}
                  className={`${row} min-h-16 ${sel ? "bg-[#ffd9c9] shadow-[inset_0_0_0_2px_#ff4d0a]" : "bg-[#f4f0ed] hover:bg-[#ebe4df]"}`}>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${sel ? "border-[#222222] bg-[#222222] text-[#ff4d0a]" : "border-[#6e6762]"}`}>
                    {sel && <Icon name="check" className="size-[14px]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{c.name}</span>
                    <span className="block text-xs text-[#4a4542]">{c.id === "single" ? "Pick one or more parts" : `${c.lines.length} items + service charges`}</span>
                  </span>
                  {c.id !== "single" && <span className="shrink-0 text-base font-bold">{inr(pkgTotal(c))}</span>}
                </button>
              );
            })}
          </div>
          <div className="shrink-0 px-4 pt-2 pb-4 min-[400px]:px-6">
            <button disabled={!cat} onClick={openPackage} className={confirmBtn}>{cat ? "Confirm" : "Choose a category"}</button>
          </div>
        </>
      ) : cat && (
        <>
          <ScreenBar title={cat.name} sub={`For ${forJob} · ${cat.startEmpty ? "tick the parts you used" : "tap to leave an item out"}`} onBack={() => setStep("categories")} backLabel="Back to categories" />
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4 min-[400px]:px-6">
            <div className="space-y-1">
              {cat.lines.map((l, i) => {
                const p = stockOf(l.partId), out = outOf(l), on = included(l, i);
                return (
                  <button key={key(l, i)} role="checkbox" aria-checked={on} disabled={out} onClick={() => toggle(l, i)}
                    className={`${row} min-h-14 hover:bg-[#f4f0ed] disabled:cursor-not-allowed`}>
                    <span className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-[#222222] bg-[#222222] text-[#ff4d0a]" : "border-[#6e6762]"}`}>
                      {on && <Icon name="check" className="size-[14px]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-base ${on || cat.startEmpty ? "" : "text-[#6e6762] line-through"}`}>{l.label}</span>
                      {p && <span className={`block text-xs ${out ? "font-semibold text-[#c2200d]" : "text-[#4a4542]"}`}>{out ? "Out of stock" : `${total(p)} in stock`}</span>}
                    </span>
                    <span className={`shrink-0 text-base ${on ? "font-semibold" : cat.startEmpty ? "text-[#4a4542]" : "text-[#6e6762] line-through"}`}>{inr(l.price)}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 border-t border-black/10 px-4 pt-4">
              {cat.service > 0 && (
                <div className="flex min-h-10 items-center justify-between text-base">
                  <span>Service charges</span><span className="font-semibold">{chosen.length ? inr(cat.service) : inr(0)}</span>
                </div>
              )}
              <div className="flex min-h-12 items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="display text-[28px] leading-9">{inr(sum)}</span>
              </div>
            </div>
            <p className="mt-2 px-4 text-xs text-[#4a4542]">Goes to {job.customer.split(" ")[0]} on WhatsApp. The items stay greyed out on the bill until they approve.</p>
          </div>
          <div className="shrink-0 px-4 pt-2 pb-4 min-[400px]:px-6">
            <button disabled={!chosen.length} onClick={confirm} className={confirmBtn}>{chosen.length ? `Confirm · ${inr(sum)}` : "Tick at least one item"}</button>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------- MY GARAGE ------------------------------- */

function GarageTab({
  parts, jobs, bills, mechanics, toggleOrder, addMechanic,
}: {
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

  const loggedToday = bills.filter((b) => b.fresh);
  const todayIn = loggedToday.reduce((s, b) => s + b.total, 0);
  const wagesMonth = mechanics.reduce((s, m) => s + m.wage, 0);
  const toOrder = parts.filter((p) => p.toOrder);
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
  const label = scope === "day" ? `${anchor} Oct` : scope === "week" ? `${weekDays[0]}–${weekDays[weekDays.length - 1]} Oct` : "October 2026";
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
        className={`flex flex-col items-center rounded-2xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] ${
          big ? "px-1 pt-2.5 pb-2" : "h-11 justify-center"
        } ${sel ? "border-transparent bg-[#222222] text-white" : d === TODAY ? "border-transparent bg-[#ff4d0a]" : "border-transparent bg-[#f4f0ed] hover:bg-[#ebe4df]"} ${d > TODAY && !sel ? "text-[#6e6762]" : ""}`}
      >
        <span className={`${big ? "text-base leading-6" : "text-sm"} font-bold`}>{d}</span>
        {big && <span className={`text-[11px] font-semibold ${sel ? "text-white/75" : d === TODAY ? "text-[#222222]" : "text-[#4a4542]"}`}>{WEEKDAYS[weekday(d)]}</span>}
        <span className={`flex h-1.5 gap-1 ${big ? "mt-1.5" : "mt-0.5"}`}>
          {data.earn > 0 && <span className={`size-1.5 rounded-full ${sel ? "bg-[#ff4d0a]" : "bg-[#222222]"}`} />}
          {restockDays.includes(d) && <span className="size-1.5 rounded-full bg-[#ff4d0a]" />}
        </span>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col px-4 min-[400px]:px-6">
      <div className="shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setPicked(false)}
            className="text-left focus-visible:outline-2 focus-visible:outline-[#222222]"
            aria-label="Show whole range"
          >
            <span className="block text-xs font-semibold text-[#4a4542] capitalize">{scope}</span>
            <span className="block text-[22px] leading-7 font-semibold tracking-[-0.01em]">{label}</span>
          </button>
          <div className="flex items-center gap-1">
            {!expanded && (
              <>
                <button aria-label="Previous week" onClick={() => shift(-7)} className="grid size-12 rotate-180 place-items-center rounded-full bg-[#f4f0ed] text-[#222222]"><Icon name="chevron" className="size-6" /></button>
                <button aria-label="Next week" onClick={() => shift(7)} className="grid size-12 place-items-center rounded-full bg-[#f4f0ed] text-[#222222]"><Icon name="chevron" className="size-6" /></button>
              </>
            )}
            <button
              aria-label={expanded ? "Collapse to week" : "Expand to full month"}
              aria-expanded={expanded}
              onClick={() => { setExpanded(!expanded); setPicked(false); }}
              className="grid size-12 place-items-center rounded-full bg-[#222222] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
            >
              <Icon name="chevron" className={`size-6 transition ${expanded ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>
        </div>

        {expanded ? (
          <div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#6e6762]">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
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
        <section className="rounded-3xl bg-[#222222] p-4 text-white">
          <p className="text-sm font-semibold text-white/60">Profit · {label}</p>
          <p className="display mt-1 text-[32px] leading-10 tracking-[-0.02em] text-[#ff4d0a]">{inr(profit)}</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            {([["In", inr(earned)], ["Parts", inr(partsCost)], ["Wages", inr(wages)], ["Jobs", String(jobCount)]] as const).map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-white/65">{l}</p>
                <p className="mt-0.5 text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Bills & services</h2>
          {rangeBills.length === 0 ? (
            <p className="rounded-2xl bg-[#f4f0ed] p-4 text-sm text-[#6e6762]">No bills logged for {label}.</p>
          ) : (
            <div className="space-y-2">
              {rangeBills.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-[#f4f0ed] p-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#222222]"><Icon name="wrench" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{b.plate}</span>
                    <span className="block truncate text-xs text-[#6e6762]">{b.vehicle} · {b.summary}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{inr(b.total)}</span>
                    <span className="block text-[11px] text-[#6e6762]">{b.day} Oct · {b.method}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#f4f0ed] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Restock</h2>
            <span className="text-xs text-[#6e6762]">{rangeRestock.length ? `Due ${rangeRestock.join(", ")} Oct` : "No restock day"}</span>
          </div>
          {toOrder.length === 0 ? (
            <p className="mt-2 text-sm text-[#6e6762]">Nothing marked. Low: {parts.filter((p) => total(p) <= p.reorder).map((p) => p.name).slice(0, 3).join(", ")}.</p>
          ) : (
            toOrder.map((p) => (
              <div key={p.id} className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
                <span className="text-sm"><span className="font-semibold">{p.name}</span> <span className="text-[#6e6762]">· {total(p)} left</span></span>
                <button onClick={() => toggleOrder(p.id)} className="text-xs font-semibold underline underline-offset-4">Ordered</button>
              </div>
            ))
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Team</h2>
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
          <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-[#f4f0ed] p-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#222222] text-base font-bold">{m.name[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{m.name}</span>
              <span className="block truncate text-xs text-[#6e6762]">{m.role} · {j ? j.plate : "No job"}</span>
            </span>
            <span className="text-right">
              <span className="block text-sm font-semibold">{inr(m.wage)}</span>
              <span className={`block text-[11px] font-semibold ${j ? "text-[#222222]" : "text-[#6e6762]"}`}>{j ? "On job" : "Free"}</span>
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
            placeholder="Mechanic name"
            className="h-12 min-w-0 flex-1 rounded-[10px] border border-[#8a837e] bg-white px-4 text-sm outline-none focus:border-[#222222]"
          />
          <button onClick={submit} className="h-12 rounded-full bg-[#ff4d0a] px-5 text-sm font-semibold text-[#222222] hover:bg-[#ff6a2e]">Add</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4f0ed] text-[#222222] text-sm font-semibold transition hover:bg-[#ebe4df] focus-visible:outline-2 focus-visible:outline-[#222222]"
        >
          <Icon name="users" className="size-[18px]" /> Add mechanic
        </button>
      )}
    </div>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

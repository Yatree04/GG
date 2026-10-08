import { useState } from "react";
import { DAILY_SEED, MONTH, PARTS_SPEND_BASE, RESTOCK_DAYS, TODAY, firstName, inr, qty } from "./model";
import type { Garage, GarageView } from "./store";
import { Icon, Label, Seg, btn } from "./ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekday = (d: number) => new Date(2026, 9, d).getDay();

export function GarageTab({ g }: { g: Garage }) {
  const [anchor, setAnchor] = useState(TODAY);
  const [picked, setPicked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* Money for one day. Earlier days come from the month so far; today is worked out from today's bills. */
  const dayData = (d: number) => {
    if (d > TODAY) return { earn: 0, jobs: 0 };
    if (d < TODAY) return DAILY_SEED[d] ?? { earn: 0, jobs: 0 };
    const paid = g.bills.filter((b) => b.paidDay === TODAY);
    return { earn: paid.reduce((s, b) => s + b.total, 0), jobs: g.bills.filter((b) => b.day === TODAY).length + g.active.length };
  };
  const partsFor = (d: number) => (d <= TODAY ? PARTS_SPEND_BASE / TODAY : 0) + (g.spend[d] ?? 0);

  const monday = anchor - ((weekday(anchor) + 6) % 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => monday + i).filter((d) => d >= 1 && d <= 31);
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = (weekday(1) + 6) % 7;

  const scope = picked ? "Day" : expanded ? "Month" : "Week";
  const range = scope === "Day" ? [anchor] : scope === "Week" ? weekDays : monthDays;
  const label = scope === "Day" ? `${anchor} ${MONTH}` : scope === "Week" ? `${weekDays[0]}–${weekDays[weekDays.length - 1]} ${MONTH}` : "October 2026";
  const earned = range.reduce((s, d) => s + dayData(d).earn, 0);
  const jobCount = range.reduce((s, d) => s + dayData(d).jobs, 0);
  const partsCost = Math.round(range.reduce((s, d) => s + partsFor(d), 0));
  const wages = Math.round(g.mechanics.reduce((s, m) => s + m.wage, 0) * (range.filter((d) => d <= TODAY).length / 31));
  const profit = earned - partsCost - wages;
  const dueTotal = g.dues.reduce((s, b) => s + b.total, 0);

  const pick = (d: number) => { setAnchor(d); setPicked(true); };
  const shift = (n: number) => { setAnchor((a) => Math.min(31, Math.max(1, a + n))); setPicked(false); };

  const dayCell = (d: number, big: boolean) => {
    const sel = picked && d === anchor, data = dayData(d);
    return (
      <button
        key={d}
        aria-label={`${d} October${data.earn ? `, earned ${inr(data.earn)}` : ""}${RESTOCK_DAYS.includes(d) ? ", restock day" : ""}`}
        aria-pressed={sel}
        onClick={() => (sel ? setPicked(false) : pick(d))}
        className={`flex flex-col items-center rounded-2xl border transition ${btn.focus} ${big ? "px-1 pt-2 pb-1.5" : "h-11 justify-center"} ${
          sel ? "border-transparent bg-[#17211d] text-white" : d === TODAY ? "border-transparent bg-[#d9ff5c]" : "border-black/10 bg-white hover:bg-[#f0f1ec]"
        } ${d > TODAY && !sel ? "text-[#6b756e]" : ""}`}
      >
        <span className={`${big ? "text-lg leading-6" : "text-sm"} font-bold`}>{d}</span>
        {big && <span className={`text-[11px] font-semibold ${sel ? "text-white/75" : "text-[#5c6660]"}`}>{WEEKDAYS[weekday(d)]}</span>}
        <span className={`flex h-1.5 gap-1 ${big ? "mt-1" : "mt-0.5"}`}>
          {data.earn > 0 && <span className={`size-1.5 rounded-full ${sel ? "bg-[#d9ff5c]" : "bg-[#3d7a00]"}`} />}
          {RESTOCK_DAYS.includes(d) && <span className="size-1.5 rounded-full bg-[#e2553f]" />}
        </span>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col px-6">
      <div className="shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.08em] text-[#5c6660] uppercase">{scope}{picked && " · tap again for the week"}</span>
            <span className="block text-lg font-semibold tracking-[-0.02em]">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            {!expanded && (
              <>
                <button aria-label="Previous week" onClick={() => shift(-7)} className={`${btn.round} size-9 rotate-180`}><Icon name="chevron" className="size-4" /></button>
                <button aria-label="Next week" onClick={() => shift(7)} className={`${btn.round} size-9`}><Icon name="chevron" className="size-4" /></button>
              </>
            )}
            <button
              aria-label={expanded ? "Show one week" : "Show the whole month"}
              aria-expanded={expanded}
              onClick={() => { setExpanded(!expanded); setPicked(false); }}
              className={`grid size-9 place-items-center rounded-full bg-[#17211d] text-white ${btn.focus}`}
            >
              <Icon name="chevron" className={`size-4 transition ${expanded ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>
        </div>
        {expanded ? (
          <div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#5c6660]">
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
        <p className="mt-1.5 flex gap-3 text-[11px] text-[#5c6660]">
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#3d7a00]" /> Money came in</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#e2553f]" /> Restock day</span>
        </p>
      </div>

      <div className="no-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pb-3">
        <section className="rounded-3xl bg-[#17211d] p-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <Label dark>Profit · {label}</Label>
              <p className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#d9ff5c]">{inr(profit)}</p>
            </div>
            {dueTotal > 0 && (
              <button onClick={() => g.setGarageView("Money")} className="rounded-xl bg-white/10 px-3 py-2 text-right hover:bg-white/15">
                <span className="block text-[11px] text-white/65">To collect</span>
                <span className="block text-sm font-semibold">{inr(dueTotal)}</span>
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            {([["In", inr(earned)], ["Parts", inr(partsCost)], ["Wages", inr(wages)], ["Jobs", String(jobCount)]] as const).map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white/10 p-2.5">
                <p className="text-[11px] text-white/65">{l}</p>
                <p className="mt-0.5 text-[13px] font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <Seg<GarageView> label="Section" options={["Money", "Restock", "Team"]} value={g.garageView} onChange={g.setGarageView} />

        {g.garageView === "Money" && <Money g={g} range={range} label={label} />}
        {g.garageView === "Restock" && <Restock g={g} />}
        {g.garageView === "Team" && <Team g={g} />}
      </div>
    </div>
  );
}

function Money({ g, range, label }: { g: Garage; range: number[]; label: string }) {
  const rangeBills = g.bills.filter((b) => range.includes(b.day) && b.method !== "Due");
  const row = (b: (typeof g.bills)[number], due = false) => (
    <button key={b.id} onClick={() => g.setBillOpen(b.id)} className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left hover:bg-[#f0f1ec] ${btn.focus} ${due ? "border-[#e2553f]/40" : "border-black/10"}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${due ? "bg-[#ffe5d7] text-[#9a3412]" : "bg-[#e9ebe5]"}`}><Icon name={due ? "clock" : "wrench"} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{b.plate}</span>
        <span className="block truncate text-xs text-[#5c6660]">{b.vehicle} · {due ? firstName(b.customer) : b.lines[0].label}</span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-semibold">{inr(b.total)}</span>
        <span className={`block text-[11px] ${due ? "font-semibold text-[#9a3412]" : "text-[#5c6660]"}`}>{due ? `Due since ${b.day} Oct` : `${b.day} Oct · ${b.method}`}</span>
      </span>
    </button>
  );
  return (
    <>
      {g.dues.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">To collect (udhari)</h2>
          <div className="space-y-2">{g.dues.map((b) => row(b, true))}</div>
        </section>
      )}
      <section>
        <h2 className="mb-2 text-sm font-semibold">Bills paid · {label}</h2>
        {rangeBills.length === 0 ? (
          <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[#5c6660]">No bills logged for {label}.</p>
        ) : <div className="space-y-2">{rangeBills.map((b) => row(b))}</div>}
      </section>
    </>
  );
}

function Restock({ g }: { g: Garage }) {
  const toOrder = g.parts.filter((p) => p.toOrder);
  const lowUnmarked = g.lowParts.filter((p) => !p.toOrder);
  const next = RESTOCK_DAYS.find((d) => d >= TODAY);
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Order list</h2>
        <span className="text-xs text-[#5c6660]">{next ? `Next restock day ${next} Oct` : "No restock day set"}</span>
      </div>
      {toOrder.length === 0 && <p className="mt-2 text-sm text-[#5c6660]">Nothing on the list. Add parts here or from Stock.</p>}
      {toOrder.map((p) => (
        <div key={p.id} className="mt-2 flex items-center justify-between gap-2 border-t border-black/10 pt-2">
          <span className="min-w-0 text-sm"><span className="font-semibold">{p.name}</span> <span className="text-[#5c6660]">· {qty(p)} left</span></span>
          {p.ordered
            ? <button onClick={() => g.receive(p.id)} aria-label={`Delivery of ${p.name} came`} className="h-9 shrink-0 rounded-full bg-[#17211d] px-3 text-xs font-semibold text-[#d9ff5c]">Delivery came</button>
            : <span className="flex shrink-0 gap-1">
                <button onClick={() => g.toggleOrder(p.id)} aria-label={`Take ${p.name} off the list`} className="grid size-9 place-items-center rounded-full hover:bg-[#f0f1ec]"><Icon name="x" className="size-4" /></button>
                <button onClick={() => g.markOrdered(p.id)} aria-label={`Mark ${p.name} ordered`} className="h-9 rounded-full border border-black/15 px-3 text-xs font-semibold">Mark ordered</button>
              </span>}
        </div>
      ))}
      {lowUnmarked.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold text-[#9a3412]">Running low, not on the list</p>
          {lowUnmarked.map((p) => (
            <div key={p.id} className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm">{p.name} <span className="text-[#5c6660]">· {qty(p)} left</span></span>
              <button onClick={() => g.toggleOrder(p.id)} aria-label={`Add ${p.name} to the order list`} className="h-9 rounded-full border border-black/15 px-3 text-xs font-semibold">Add to list</button>
            </div>
          ))}
        </>
      )}
      <button onClick={() => g.openStock("all")} className={`mt-4 ${btn.link} text-xs`}>Open Stock</button>
    </section>
  );
}

function Team({ g }: { g: Garage }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const submit = () => { if (!name.trim()) return; g.addMechanic(name.trim()); setName(""); setAdding(false); };
  return (
    <div className="space-y-2">
      {g.mechanics.map((m) => {
        const j = g.mechanicJob(m);
        return (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e9ebe5] text-base font-bold">{m.name[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{m.name}</span>
              <span className="block truncate text-xs text-[#5c6660]">{m.role} · {inr(m.wage)}/month</span>
            </span>
            {j ? (
              <button onClick={() => g.openJob(j.id)} className="rounded-xl bg-[#f1ffd0] px-2.5 py-1.5 text-right hover:bg-[#e6fbb5]">
                <span className="block text-[11px] font-semibold text-[#3d7a00]">On job</span>
                <span className="flex items-center gap-0.5 text-xs font-semibold">{j.plate} <Icon name="chevron" className="size-3" /></span>
              </button>
            ) : <span className="text-xs font-semibold text-[#5c6660]">Free</span>}
          </div>
        );
      })}
      {adding ? (
        <div className="flex gap-2">
          <input autoFocus aria-label="Mechanic name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Mechanic name"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-[#17211d]" />
          <button onClick={submit} disabled={!name.trim()} className="h-12 rounded-2xl bg-[#17211d] px-5 text-sm font-semibold text-white disabled:opacity-40">Add</button>
          <button onClick={() => setAdding(false)} className={btn.secondary}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={btn.dashed}><Icon name="users" className="size-4" /> Add mechanic</button>
      )}
    </div>
  );
}

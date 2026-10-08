import { useEffect, useRef, useState } from "react";
import {
  APPROVAL_LIMIT, SERVICES, firstName, singular, inr, isAgreeing, jobTotal, normPlate, qty, shortVehicle, type Item, type Job, type PayMethod,
} from "./model";
import type { Garage } from "./store";
import { Icon, Label, Seg, Sheet, btn } from "./ui";

const STEPS = ["Queued", "Inspection", "In work", "Ready"] as const;

export function JobsTab({ g }: { g: Garage }) {
  const [view, setView] = useState<"Cards" | "All jobs">("Cards");
  const [sheet, setSheet] = useState<null | "scan" | "add" | "mechanic">(null);
  const track = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);
  const active = g.active;
  const idx = Math.max(0, active.findIndex((j) => j.id === g.currentJob));
  const cur = active[idx];

  // Keep the swipe position in step with the current job, whichever tab or sheet chose it.
  useEffect(() => {
    const el = track.current;
    if (el && Math.round(el.scrollLeft / el.clientWidth) !== idx) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, [idx, view, active.length]);

  const go = (i: number) => active[i] && g.setCurrentJob(active[i].id);
  const waiting = g.pending.length, ready = active.filter((j) => j.stage === "Ready").length;

  return (
    <div className="relative flex h-full flex-col">
      <div className="mb-3 flex shrink-0 items-center gap-2 px-6">
        <p className="min-w-0 flex-1 truncate text-[13px] text-[#5c6660]">
          <b className="text-[#17211d]">{active.length} open</b>
          {waiting > 0 && <> · {waiting} awaiting OK</>}
          {ready > 0 && <> · {ready} ready</>}
        </p>
        <button onClick={() => setSheet("scan")} className={`flex h-10 items-center gap-2 rounded-full bg-[#17211d] px-4 text-sm font-semibold text-[#d9ff5c] transition hover:bg-[#25332d] ${btn.focus}`}>
          <Icon name="scan" className="size-4" /> Scan plate
        </button>
        <button
          aria-label={view === "Cards" ? "Show all jobs" : "Show job cards"}
          title={view === "Cards" ? "All jobs" : "Job cards"}
          onClick={() => setView(view === "Cards" ? "All jobs" : "Cards")}
          className={btn.round}
        >
          <Icon name={view === "Cards" ? "grid" : "wrench"} className="size-4" />
        </button>
      </div>

      {view === "All jobs" ? (
        <AllJobs g={g} onOpen={(j) => { g.setCurrentJob(j.id); setView("Cards"); }} />
      ) : !cur ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-[#5c6660]">No open jobs. Scan a plate when the next vehicle comes in.</p>
          <button onClick={() => setSheet("scan")} className={`mx-auto mt-4 ${btn.secondary}`}><Icon name="scan" className="size-4" /> Scan plate</button>
        </div>
      ) : (
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
          <div
            ref={track}
            onScroll={(e) => {
              // Only pick a new job once the swipe has come to rest, so a scroll started by a tap
              // on the dots or arrows can't switch jobs halfway through.
              const el = e.currentTarget;
              window.clearTimeout(settle.current);
              settle.current = window.setTimeout(() => {
                const i = Math.round(el.scrollLeft / el.clientWidth);
                if (active[i] && active[i].id !== g.currentJob) g.setCurrentJob(active[i].id);
              }, 140);
            }}
            className="no-scrollbar flex snap-x snap-mandatory items-start overflow-x-auto"
          >
            {active.map((j) => (
              <div key={j.id} className="w-full shrink-0 snap-center px-6" aria-hidden={j.id !== cur.id}>
                <BillCard job={j} g={g} />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <button aria-label="Previous job" disabled={idx === 0} onClick={() => go(idx - 1)} className={`${btn.round} size-9 rotate-180 disabled:opacity-30`}>
              <Icon name="chevron" className="size-4" />
            </button>
            <div className="flex gap-1.5">
              {active.map((j, i) => (
                <button key={j.id} aria-label={`Job ${i + 1}: ${j.plate}`} aria-current={i === idx} onClick={() => go(i)} className="grid h-6 place-items-center">
                  <span className={`block h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[#17211d]" : "w-1.5 bg-black/25"}`} />
                </button>
              ))}
            </div>
            <button aria-label="Next job" disabled={idx === active.length - 1} onClick={() => go(idx + 1)} className={`${btn.round} size-9 disabled:opacity-30`}>
              <Icon name="chevron" className="size-4" />
            </button>
          </div>

          <JobActions job={cur} g={g} onAdd={() => setSheet("add")} onMechanic={() => setSheet("mechanic")} />
        </div>
      )}

      {sheet === "scan" && <ScanSheet g={g} onClose={() => setSheet(null)} onDone={() => { setSheet(null); setView("Cards"); }} />}
      {sheet === "add" && cur && <AddSheet g={g} job={cur} onClose={() => setSheet(null)} />}
      {sheet === "mechanic" && cur && <MechanicSheet g={g} job={cur} onClose={() => setSheet(null)} />}
    </div>
  );
}

/* ---------------------------------- card ---------------------------------- */

function BillCard({ job, g }: { job: Job; g: Garage }) {
  const services = job.items.filter((i) => i.kind === "service");
  const partItems = job.items.filter((i) => i.kind === "part");
  const step = STEPS.indexOf(job.stage as (typeof STEPS)[number]);
  const waitingAmt = job.items.filter((i) => i.status === "pending").reduce((s, i) => s + i.price, 0);
  const canRemove = (i: Item) => isAgreeing(job) || i.status !== "ok";

  const row = (i: Item) => (
    <div key={i.id} className="py-1.5">
      <div className={`flex items-start justify-between gap-3 text-sm ${i.status === "ok" ? "" : "text-white/45"}`}>
        <span className={`min-w-0 ${i.status === "declined" ? "line-through" : ""}`}>{i.label}</span>
        <span className="flex shrink-0 items-center gap-1">
          <span className={`font-semibold ${i.status === "declined" ? "line-through" : ""}`}>{inr(i.price)}</span>
          {canRemove(i) && (
            <button aria-label={`Remove ${i.label}`} onClick={() => g.removeItem(job.id, i.id)} className="-my-1 grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
              <Icon name="x" className="size-4" />
            </button>
          )}
        </span>
      </div>
      {i.status === "pending" && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/30 px-2 py-0.5 text-[11px] font-semibold text-white/75">Awaiting {firstName(job.customer)}’s OK on WhatsApp</span>
          <button onClick={() => g.reply(job.id, i.id, true)} className="h-8 rounded-full bg-[#d9ff5c] px-3 text-xs font-bold text-[#17211d]">They said yes</button>
          <button onClick={() => g.reply(job.id, i.id, false)} className="h-8 rounded-full border border-white/30 px-3 text-xs font-semibold">No</button>
        </div>
      )}
      {i.status === "declined" && <p className="mt-0.5 text-[11px] text-white/55">Declined by customer · not on the bill</p>}
    </div>
  );

  return (
    <section aria-label={`Job card ${job.plate}`} className="rounded-3xl bg-[#17211d] p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#d9ff5c] px-3 py-1 text-xs font-bold text-[#17211d]">
            <span className="size-1.5 rounded-full bg-[#17211d]" />
            {job.stage.toUpperCase()}
          </span>
          <h2 className="mt-3 text-[26px] leading-8 font-bold tracking-[0.02em]">{job.plate}</h2>
          <p className="mt-0.5 truncate text-sm text-white/65">{job.vehicle} · {job.customer}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-white/60">Ready by</p>
          <p className="mt-0.5 text-sm font-semibold">{job.ready}</p>
        </div>
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Job progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1 rounded-full ${i <= step ? "bg-[#d9ff5c]" : "bg-white/15"}`} />
            <span className={`mt-1 block text-[10px] font-semibold ${i === step ? "text-white" : "text-white/45"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 border-t border-white/10 pt-3">
        <Label dark>Services</Label>
        {services.length ? services.map(row) : <p className="py-1.5 text-sm text-white/45">No services yet</p>}
        <div className="mt-3"><Label dark>Parts</Label></div>
        {partItems.length ? partItems.map(row) : <p className="py-1.5 text-sm text-white/45">No parts yet</p>}
        <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-sm text-white/75">
          <div className="flex justify-between"><span>Labour charges</span><span>{inr(job.labour)}</span></div>
          <div className="flex justify-between"><span>Tool charges</span><span>{inr(job.tool)}</span></div>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
        <div>
          <Label dark>{job.stage === "Ready" ? "Bill" : "Estimate"}</Label>
          {waitingAmt > 0 && <p className="mt-0.5 text-[11px] text-white/60">+{inr(waitingAmt)} if approved</p>}
        </div>
        <p className="text-2xl font-bold tracking-[-0.02em] text-[#d9ff5c]">{inr(jobTotal(job))}</p>
      </div>
    </section>
  );
}

/* ------------------------------ below the card ----------------------------- */

function JobActions({ job, g, onAdd, onMechanic }: { job: Job; g: Garage; onAdd: () => void; onMechanic: () => void }) {
  const [pay, setPay] = useState<"" | "UPI" | "Cash" | "Pay later">("");
  const [allLog, setAllLog] = useState(false);
  useEffect(() => setPay(""), [job.id]);
  const who = firstName(job.customer);
  const pendingItem = job.items.find((i) => i.status === "pending");
  const history = g.bills.filter((b) => b.plate === job.plate && b.jobId !== job.id);

  const primary = (() => {
    switch (job.stage) {
      case "Queued":
        return <button onClick={() => g.advance(job.id)} className={btn.primary}>Start inspection</button>;
      case "Inspection":
        return (
          <button disabled={!job.items.length} onClick={() => g.advance(job.id)} className={btn.primary}>
            <Icon name="send" className="size-4" /> {job.items.length ? `Send estimate ${inr(jobTotal(job))} · start work` : "Add work before sending the estimate"}
          </button>
        );
      case "In work":
        return (
          <button disabled={!!pendingItem} onClick={() => g.advance(job.id)} className={btn.primary}>
            {pendingItem ? `Waiting for ${who}’s reply on ${pendingItem.label.split(" · ")[0]}` : <><Icon name="check" className="size-4" /> Mark ready · tell {who}</>}
          </button>
        );
      case "Ready":
        return (
          <div className="space-y-2">
            <Label>How did {who} pay?</Label>
            <Seg label="Payment method" options={["UPI", "Cash", "Pay later"]} value={pay} onChange={setPay} />
            <button disabled={!pay} onClick={() => g.closeBill(job.id, (pay === "Pay later" ? "Due" : pay) as PayMethod)} className={btn.primary}>
              {pay ? `Close bill · ${inr(jobTotal(job))}${pay === "Pay later" ? " due" : ""}` : "Choose how they paid"}
            </button>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="space-y-4 px-6 pt-4">
      {primary}
      {job.stage !== "Ready" && (
        <div>
          <button onClick={onAdd} className={btn.dashed}><Icon name="plus" className="size-4" /> Add part or service</button>
          {!isAgreeing(job) && <p className="mt-1.5 px-1 text-xs text-[#5c6660]">Parts over {inr(APPROVAL_LIMIT)} wait for {who}’s OK. Others go on the bill and {who} gets the new total.</p>}
        </div>
      )}

      <section className="rounded-2xl border border-black/10 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Label>Customer</Label>
            <p className="mt-1 font-semibold">{job.customer}</p>
            <p className="text-sm text-[#5c6660]">{job.phone}</p>
          </div>
          <button onClick={onMechanic} className="shrink-0 rounded-xl bg-[#e9ebe5] px-3 py-2 text-left hover:bg-[#dde0d8]" aria-label={`Mechanic ${job.mechanic}. Change mechanic`}>
            <span className="block text-[11px] font-semibold text-[#5c6660]">Mechanic</span>
            <span className="flex items-center gap-1 text-sm font-semibold">{job.mechanic} <Icon name="chevron" className="size-3.5" /></span>
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => g.notify(`Calling ${job.customer} · ${job.phone}`)} className={btn.secondary}><Icon name="phone" className="size-4" /> Call</button>
          <button onClick={() => g.sendUpdate(job.id)} className={btn.secondary}><Icon name="send" className="size-4" /> Send update</button>
        </div>

        <div className="mt-4">
          <Label>WhatsApp & updates</Label>
          <ol className="mt-1.5 space-y-1.5">
            {(allLog ? job.log : job.log.slice(0, 2)).map((e, i) => (
              <li key={i} className="flex gap-2 text-[13px]"><span className="w-16 shrink-0 text-[#5c6660]">{e.time}</span><span>{e.text}</span></li>
            ))}
          </ol>
          {job.log.length > 2 && <button onClick={() => setAllLog(!allLog)} className={`mt-1.5 ${btn.link} text-xs`}>{allLog ? "Show less" : `Show all ${job.log.length}`}</button>}
        </div>

        <div className="mt-4">
          <Label>Past visits · {job.plate}</Label>
          {history.length === 0 ? <p className="mt-1 text-[13px] text-[#5c6660]">First visit to the garage.</p> : history.map((b) => (
            <button key={b.id} onClick={() => g.setBillOpen(b.id)} className="mt-1.5 flex w-full items-center justify-between rounded-xl bg-[#f3f4ef] px-3 py-2 text-left text-[13px] hover:bg-[#e9ebe5]">
              <span><b>{b.day} Oct</b> · {b.lines[0].label}</span>
              <span className="flex items-center gap-1 font-semibold">{inr(b.total)} <Icon name="chevron" className="size-3.5" /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* --------------------------------- all jobs -------------------------------- */

function AllJobs({ g, onOpen }: { g: Garage; onOpen: (j: Job) => void }) {
  return (
    <div className="no-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-2 overflow-y-auto px-6 pb-3">
      {g.jobs.map((j) => {
        const done = j.stage === "Done", hot = j.stage === "In work", wait = j.items.some((i) => i.status === "pending");
        const b = done ? g.bills.find((x) => x.id === j.billId) : undefined;
        return (
          <button
            key={j.id}
            onClick={() => (done ? j.billId && g.setBillOpen(j.billId) : onOpen(j))}
            className={`flex min-h-[156px] flex-col justify-between rounded-3xl border p-3.5 text-left transition ${btn.focus} ${
              done ? "border-black/10 bg-white/60" : hot ? "border-transparent bg-[#17211d] text-white" : "border-black/10 bg-white hover:bg-[#f0f1ec]"
            }`}
          >
            <span>
              <span className="flex flex-wrap gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${hot ? "bg-[#d9ff5c] text-[#17211d]" : "bg-[#e9ebe5] text-[#3f4943]"}`}>{done ? (b?.method === "Due" ? "Billed · due" : "Paid") : j.stage}</span>
                {wait && <span className="rounded-full bg-[#ffe5d7] px-2 py-0.5 text-[10px] font-bold text-[#9a3412]">Awaiting OK</span>}
              </span>
              <span className="mt-2 block text-sm leading-5 font-bold tracking-wide">{j.plate}</span>
              <span className="block truncate text-xs opacity-70">{shortVehicle(j.vehicle)} · {firstName(j.customer)}</span>
            </span>
            <span>
              <span className="block text-[11px] opacity-70">{done ? "Tap to see the bill" : `${j.mechanic} · ready ${j.ready}`}</span>
              <span className="block text-xl leading-6 font-bold tracking-[-0.02em]">{inr(b?.total ?? jobTotal(j))}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- sheets --------------------------------- */

const UNKNOWN_PLATE = "MH 12 KL 9090";

function ScanSheet({ g, onClose, onDone }: { g: Garage; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { kind: "error" | "new" | "billed"; plate: string; job?: Job }>(null);
  const [form, setForm] = useState({ customer: "", phone: "", vehicle: "" });
  const timer = useRef<number | undefined>(undefined);
  const cursor = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const lookup = (raw: string) => {
    const n = normPlate(raw);
    if (!n) return setResult({ kind: "error", plate: "" });
    const open = g.active.find((j) => normPlate(j.plate) === n);
    if (open) { g.openJob(open.id); g.notify(`Matched ${open.plate} · ${shortVehicle(open.vehicle)}`); return onDone(); }
    const old = g.jobs.find((j) => normPlate(j.plate) === n);
    const plate = old?.plate ?? raw.toUpperCase().trim();
    if (old) setForm({ customer: old.customer, phone: old.phone, vehicle: old.vehicle });
    setResult({ kind: old ? "billed" : "new", plate, job: old });
  };

  // Demo camera: reads the open jobs in turn, then a plate the garage has never seen.
  const scan = () => {
    setResult(null);
    setScanning(true);
    timer.current = window.setTimeout(() => {
      const pool = [...g.active.map((j) => j.plate), UNKNOWN_PLATE];
      const read = pool[cursor.current++ % pool.length];
      setScanning(false);
      setText(read);
      lookup(read);
    }, 1200);
  };

  const create = () => {
    if (!result) return;
    g.createJob({ plate: result.plate, ...form });
    onDone();
  };
  const formOk = form.customer.trim() && form.phone.trim() && form.vehicle.trim();
  const field = "h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-[#17211d]";

  return (
    <Sheet title="Scan number plate" onClose={onClose}>
      <div className="relative grid h-36 place-items-center overflow-hidden rounded-2xl bg-[#17211d]">
        <div className="relative grid h-16 w-64 place-items-center rounded-lg border-2 border-[#d9ff5c]">
          <span className="text-lg font-bold tracking-widest text-white/85">{scanning ? "READING…" : text.toUpperCase() || "— — — —"}</span>
          {scanning && <span className="absolute inset-x-0 h-0.5 animate-[scanline_1.2s_ease-in-out_infinite] bg-[#d9ff5c]" />}
        </div>
        <p className="absolute bottom-2 text-[11px] text-white/60">Align the plate inside the frame</p>
      </div>

      <button onClick={scan} disabled={scanning} className={`mt-3 ${btn.primary} h-12`}>
        <Icon name="scan" className="size-4" /> {scanning ? "Scanning…" : "Scan plate"}
      </button>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === "Enter" && lookup(text)}
          placeholder="or type the plate, e.g. MH 12 QR 4821"
          aria-label="Number plate"
          className={`${field} min-w-0 flex-1 font-semibold tracking-wide uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case`}
        />
        <button onClick={() => lookup(text)} className={btn.secondary}>Find</button>
      </div>

      {result?.kind === "error" && <p role="alert" className="mt-2 text-sm font-medium text-[#b42318]">Type or scan a number plate first.</p>}

      {(result?.kind === "new" || result?.kind === "billed") && (
        <div className="mt-4 space-y-2 rounded-2xl border border-black/10 bg-white p-4" role="region" aria-label="New job card">
          <p className="text-sm font-semibold">
            {result.kind === "new" ? `${result.plate} is new to the garage` : `${result.plate} was here before · details filled in`}
          </p>
          <p className="text-xs text-[#5c6660]">Open a job card. {result.kind === "new" ? "Save the customer once; next time the scan finds them." : "Check the details, then open a new job."}</p>
          <input aria-label="Customer name" placeholder="Customer name" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className={field} />
          <input aria-label="WhatsApp number" placeholder="WhatsApp number" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
          <input aria-label="Vehicle" placeholder="Vehicle, e.g. Maruti Swift · 2018" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className={field} />
          {result.kind === "new" && !formOk && (
            <button onClick={() => setForm({ customer: "Kiran Pawar", phone: "+91 90110 64482", vehicle: "Maruti Swift · 2018" })} className={`${btn.link} text-xs`}>Fill sample details</button>
          )}
          <button disabled={!formOk} onClick={create} className={`${btn.primary} h-12`}>{formOk ? "Open job card" : "Add name, number and vehicle"}</button>
        </div>
      )}
    </Sheet>
  );
}

function AddSheet({ g, job, onClose }: { g: Garage; job: Job; onClose: () => void }) {
  const [kind, setKind] = useState<"Parts" | "Services">("Parts");
  const [pick, setPick] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const part = g.parts.find((p) => p.id === pick);
  const service = SERVICES.find((s) => s.label === pick);
  const who = firstName(job.customer);
  const needsOk = !!part && !isAgreeing(job) && part.price >= APPROVAL_LIMIT;

  const choosePart = (id: string) => {
    const p = g.parts.find((x) => x.id === id)!;
    setPick(id);
    setBrand([...p.brands].sort((a, b) => b.qty - a.qty).find((b) => b.qty > 0)?.brand ?? null);
  };
  const confirm = () => {
    if (part && brand) g.addItem(job.id, { label: `${singular(part.name)} · ${brand}`, kind: "part", price: part.price, partId: part.id, brand });
    else if (service) g.addItem(job.id, { label: service.label, kind: "service", price: service.price });
    onClose();
  };
  const ready = (part && brand) || service;
  const outcome = !ready ? "Pick a part or service" : isAgreeing(job) ? "Add to estimate" : needsOk ? `Add · ask ${who} on WhatsApp` : `Add · send ${who} the new total`;
  const opt = (sel: boolean) => `flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm transition ${btn.focus} ${sel ? "border-[#17211d] bg-[#f1ffd0] shadow-[inset_0_0_0_1px_#17211d]" : "border-black/10 bg-white hover:bg-[#f0f1ec]"}`;

  return (
    <Sheet
      title={`Add to ${job.plate}`}
      onClose={onClose}
      footer={
        <>
          {needsOk && <p className="mb-2 text-xs text-[#9a3412]">Over {inr(APPROVAL_LIMIT)}: stays greyed out on the bill until {who} says yes.</p>}
          <button disabled={!ready} onClick={confirm} className={btn.primary}>{outcome}</button>
        </>
      }
    >
      <Seg label="Item type" options={["Parts", "Services"]} value={kind} onChange={(k) => { setKind(k); setPick(null); }} />
      <div className="mt-3 space-y-2">
        {kind === "Parts" ? g.parts.map((p) => {
          const out = qty(p) === 0, sel = pick === p.id;
          return (
            <div key={p.id}>
              <button disabled={out} aria-pressed={sel} onClick={() => choosePart(p.id)} className={`${opt(sel)} disabled:opacity-40`}>
                <span><span className="block font-semibold">{p.name}</span><span className="text-xs text-[#5c6660]">{out ? "Out of stock" : `${qty(p)} in stock`}</span></span>
                <span className="flex items-center gap-2">
                  {!isAgreeing(job) && p.price >= APPROVAL_LIMIT && <span className="rounded-full bg-[#ffe5d7] px-2 py-0.5 text-[10px] font-bold text-[#9a3412]">Needs OK</span>}
                  <span className="font-semibold">{inr(p.price)}</span>
                </span>
              </button>
              {sel && (
                <div className="mt-2 flex flex-wrap gap-2 pl-1" role="radiogroup" aria-label="Brand">
                  {p.brands.map((b) => (
                    <button key={b.brand} role="radio" aria-checked={brand === b.brand} disabled={!b.qty} onClick={() => setBrand(b.brand)}
                      className={`h-9 rounded-full border px-3 text-xs font-semibold disabled:opacity-40 ${brand === b.brand ? "border-transparent bg-[#17211d] text-[#d9ff5c]" : "border-black/15 bg-white"}`}>
                      {b.brand} · {b.qty}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }) : SERVICES.map((s) => (
          <button key={s.label} aria-pressed={pick === s.label} onClick={() => setPick(s.label)} className={opt(pick === s.label)}>
            <span className="font-semibold">{s.label}</span>
            <span className="font-semibold">{inr(s.price)}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function MechanicSheet({ g, job, onClose }: { g: Garage; job: Job; onClose: () => void }) {
  return (
    <Sheet title="Who works on it?" onClose={onClose}>
      <div className="space-y-2">
        {g.mechanics.map((m) => {
          const on = g.mechanicJob(m), sel = m.name === job.mechanic;
          return (
            <button key={m.id} aria-pressed={sel} onClick={() => { if (!sel) g.assign(job.id, m.name); onClose(); }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${sel ? "border-[#17211d] bg-[#f1ffd0]" : "border-black/10 bg-white hover:bg-[#f0f1ec]"}`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e9ebe5] font-bold">{m.name[0]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{m.name}</span>
                <span className="block text-xs text-[#5c6660]">{m.role} · {on ? (on.id === job.id ? "On this job" : `Busy on ${on.plate}`) : "Free now"}</span>
              </span>
              {sel && <Icon name="check" className="size-5" />}
            </button>
          );
        })}
        <p className="pt-1 text-xs text-[#5c6660]">Add mechanics in My Garage → Team.</p>
      </div>
    </Sheet>
  );
}

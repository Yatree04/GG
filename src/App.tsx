import { GarageTab } from "./GarageTab";
import { JobsTab } from "./JobsTab";
import { MONTH, TODAY, firstName, inr, qty } from "./model";
import { StockTab } from "./StockTab";
import { useGarage, type Garage, type Tab } from "./store";
import { Icon, Label, Sheet, btn, type IconName } from "./ui";
import { useState } from "react";

export default function App() {
  const g = useGarage();
  const [bell, setBell] = useState(false);
  const alerts = useAlerts(g);

  const navItems: { label: Tab; icon: IconName; badge: number }[] = [
    { label: "Stock", icon: "box", badge: g.lowParts.filter((p) => !p.toOrder).length },
    { label: "Jobs", icon: "wrench", badge: g.pending.length },
    { label: "My Garage", icon: "garage", badge: g.dues.length },
  ];

  return (
    <main className="min-h-dvh bg-[#e9e9e4] text-[#17211d] sm:px-6 sm:py-8">
      <div className="mx-auto w-full overflow-hidden bg-[#f8f8f4] shadow-[0_24px_80px_rgba(20,30,26,0.14)] sm:max-w-[430px] sm:rounded-[40px] sm:border sm:border-black/10">
        <div className="relative flex h-dvh flex-col sm:h-[860px]">
          <header className="shrink-0 px-6 pt-7 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#5c6660]">Thursday, {TODAY} {MONTH} · {g.tab}</p>
                <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.04em]">Sharma Motors</h1>
              </div>
              <button
                aria-label={`Notifications, ${alerts.length} need attention`}
                onClick={() => setBell(true)}
                className={`relative grid size-12 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#f0f1ec] ${btn.focus}`}
              >
                <Icon name="bell" />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-[#e2553f] px-1 text-[11px] font-bold text-white ring-2 ring-[#f8f8f4]">{alerts.length}</span>
                )}
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1">
            {g.tab === "Stock" && <StockTab g={g} />}
            {g.tab === "Jobs" && <JobsTab g={g} />}
            {g.tab === "My Garage" && <GarageTab g={g} />}
          </div>

          <nav aria-label="Primary navigation" className="shrink-0 border-t border-black/10 bg-[#f8f8f4] px-4 pt-2 pb-4">
            <div className="grid grid-cols-3">
              {navItems.map(({ label, icon, badge }) => {
                const active = g.tab === label;
                return (
                  <button
                    key={label}
                    aria-current={active ? "page" : undefined}
                    aria-label={badge ? `${label}, ${badge} need attention` : label}
                    onClick={() => g.setTab(label)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-semibold transition ${btn.focus} ${
                      active ? "text-[#17211d]" : "text-[#5c6660] hover:text-[#17211d]"
                    }`}
                  >
                    <span className={`relative grid h-8 w-14 place-items-center rounded-full transition ${active ? "bg-[#d9ff5c]" : ""}`}>
                      <Icon name={icon} />
                      {badge > 0 && (
                        <span className="absolute -top-1 right-1 grid size-4 place-items-center rounded-full bg-[#e2553f] text-[9px] text-white">{badge}</span>
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
            className={`absolute top-3 right-5 left-5 z-40 flex items-center gap-3 rounded-2xl bg-[#17211d] px-4 py-3 text-sm font-medium text-white shadow-xl transition-all ${
              g.notice ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <span className="flex-1">{g.notice?.msg}</span>
            {g.notice?.undo && (
              <button onClick={() => { g.notice?.undo?.(); g.setNotice(null); }} className="flex h-9 shrink-0 items-center gap-1 rounded-full px-3 font-bold text-[#d9ff5c] hover:bg-white/10">
                <Icon name="undo" className="size-4" /> Undo
              </button>
            )}
          </div>

          {g.billOpen && <BillSheet g={g} />}
          {bell && <AlertsSheet alerts={alerts} onClose={() => setBell(false)} />}
        </div>
      </div>
    </main>
  );
}

/* ------------------------------ notifications ------------------------------ */

type Alert = { id: string; icon: IconName; title: string; detail: string; action: string; go: () => void };

/** One list of everything that needs the owner, each with a way to act on it. */
function useAlerts(g: Garage): Alert[] {
  const out: Alert[] = [];
  g.pending.forEach(({ job, item }) => out.push({
    id: `p${item.id}`, icon: "send", title: `${firstName(job.customer)} hasn’t replied`, detail: `${item.label} ${inr(item.price)} on ${job.plate}`, action: "Open job", go: () => g.openJob(job.id),
  }));
  g.active.filter((j) => j.stage === "Ready").forEach((j) => out.push({
    id: `r${j.id}`, icon: "check", title: `${j.plate} is ready for pickup`, detail: `Take payment from ${firstName(j.customer)} and close the bill`, action: "Open job", go: () => g.openJob(j.id),
  }));
  const low = g.lowParts.filter((p) => !p.toOrder);
  if (low.length) out.push({
    id: "low", icon: "alert", title: `${low.length} part${low.length > 1 ? "s" : ""} running low`, detail: low.map((p) => `${p.name} (${qty(p)})`).join(", "), action: "See stock", go: () => g.openStock("low"),
  });
  const ordered = g.parts.filter((p) => p.ordered);
  if (ordered.length) out.push({
    id: "ord", icon: "box", title: `${ordered.length} order${ordered.length > 1 ? "s" : ""} on the way`, detail: "Tap Delivery came when it arrives", action: "Restock", go: () => g.openGarage("Restock"),
  });
  g.dues.forEach((b) => out.push({
    id: `d${b.id}`, icon: "clock", title: `${inr(b.total)} due from ${firstName(b.customer)}`, detail: `${b.plate} · billed ${b.day} Oct`, action: "See bill", go: () => g.setBillOpen(b.id),
  }));
  return out;
}

function AlertsSheet({ alerts, onClose }: { alerts: Alert[]; onClose: () => void }) {
  return (
    <Sheet title="Needs your attention" onClose={onClose}>
      {alerts.length === 0 && <p className="py-6 text-center text-sm text-[#5c6660]">All clear. Nothing is waiting on you.</p>}
      <div className="space-y-2">
        {alerts.map((a) => (
          <button key={a.id} onClick={() => { onClose(); a.go(); }} className={`flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 text-left hover:bg-[#f0f1ec] ${btn.focus}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9ebe5]"><Icon name={a.icon} className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{a.title}</span>
              <span className="block text-xs text-[#5c6660]">{a.detail}</span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold">{a.action} <Icon name="chevron" className="size-3.5" /></span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------------------------- bill ---------------------------------- */

function BillSheet({ g }: { g: Garage }) {
  const b = g.bills.find((x) => x.id === g.billOpen);
  if (!b) return null;
  const close = () => g.setBillOpen(null);
  const job = b.jobId ? g.jobs.find((j) => j.id === b.jobId) : undefined;
  return (
    <Sheet
      title={`Bill · ${b.plate}`}
      onClose={close}
      footer={b.method === "Due" ? (
        <div className="space-y-2">
          <Label>{firstName(b.customer)} paid now by</Label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => g.collect(b.id, "UPI")} className={`${btn.primary} h-12`}>UPI</button>
            <button onClick={() => g.collect(b.id, "Cash")} className={`${btn.primary} h-12`}>Cash</button>
          </div>
        </div>
      ) : (
        <button onClick={() => g.notify(`Bill sent again to ${firstName(b.customer)} on WhatsApp`)} className={`${btn.secondary} w-full`}><Icon name="send" className="size-4" /> Send bill again on WhatsApp</button>
      )}
    >
      <div className="rounded-2xl bg-[#17211d] p-4 text-white">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-lg font-bold tracking-wide">{b.plate}</p>
            <p className="text-sm text-white/65">{b.vehicle} · {b.customer}</p>
          </div>
          <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${b.method === "Due" ? "bg-[#ffe5d7] text-[#9a3412]" : "bg-[#d9ff5c] text-[#17211d]"}`}>
            {b.method === "Due" ? "DUE" : `PAID · ${b.method}`}
          </span>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
          {b.lines.map((l, i) => <div key={i} className="flex justify-between gap-3"><span className="text-white/85">{l.label}</span><span className="font-semibold">{inr(l.price)}</span></div>)}
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
          <Label dark>Total · {b.day} Oct</Label>
          <p className="text-2xl font-bold text-[#d9ff5c]">{inr(b.total)}</p>
        </div>
      </div>
      {job && (
        <div className="mt-4">
          <Label>What happened</Label>
          <ol className="mt-1.5 space-y-1.5">
            {job.log.slice(0, 5).map((e, i) => <li key={i} className="flex gap-2 text-[13px]"><span className="w-16 shrink-0 text-[#5c6660]">{e.time}</span><span>{e.text}</span></li>)}
          </ol>
        </div>
      )}
    </Sheet>
  );
}

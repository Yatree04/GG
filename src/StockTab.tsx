import { useMemo, useState } from "react";
import { inr, isLow, qty } from "./model";
import type { Garage, StockFilter } from "./store";
import { Icon, btn, type IconName } from "./ui";

export function StockTab({ g }: { g: Garage }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const { parts, stockFilter: filter, setStockFilter: setFilter } = g;

  const units = parts.reduce((s, p) => s + qty(p), 0);
  const orderParts = parts.filter((p) => p.toOrder);
  const value = parts.reduce((s, p) => s + qty(p) * p.cost, 0);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return parts.filter((p) => {
      const matches = !s || p.name.toLowerCase().includes(s) || p.brands.some((b) => b.brand.toLowerCase().includes(s));
      const scoped = filter === "all" || (filter === "low" ? isLow(p) : p.toOrder);
      return matches && scoped;
    });
  }, [parts, q, filter]);

  const tiles: { key: StockFilter; label: string; value: string; icon: IconName }[] = [
    { key: "all", label: "All parts", value: String(units), icon: "box" },
    { key: "low", label: "Running low", value: String(g.lowParts.length), icon: "alert" },
    { key: "order", label: "To order", value: String(orderParts.length), icon: "send" },
  ];
  const usedIn = (partId: string) => g.active.filter((j) => j.items.some((i) => i.partId === partId && i.status !== "declined"));

  return (
    <div className="flex h-full flex-col px-6">
      <label className="relative flex h-12 shrink-0 items-center rounded-full border border-black/10 bg-white pr-2 pl-4 focus-within:border-[#17211d]">
        <span className="sr-only">Search parts</span>
        <Icon name="search" className="size-5 shrink-0 text-[#5c6660]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pistons, brake pads, Bosch…"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-[#6b756e]"
        />
        {q && <button aria-label="Clear search" onClick={() => setQ("")} className="grid size-9 place-items-center rounded-full hover:bg-[#f0f1ec]"><Icon name="x" className="size-4" /></button>}
      </label>

      <div className="mt-3 grid shrink-0 grid-cols-3 gap-2" role="radiogroup" aria-label="Show parts">
        {tiles.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              role="radio"
              aria-checked={active}
              onClick={() => setFilter(t.key)}
              className={`flex h-[92px] flex-col justify-between rounded-3xl border p-3 text-left transition ${btn.focus} ${
                active ? "border-transparent bg-[#d9ff5c]" : "border-black/10 bg-white hover:bg-[#f0f1ec]"
              }`}
            >
              <span className={`grid size-8 place-items-center rounded-xl ${active ? "bg-[#17211d]/10" : "bg-[#e9ebe5]"}`}>
                <Icon name={t.icon} className="size-4" />
              </span>
              <span>
                <span className={`block text-[11px] font-semibold ${active ? "text-[#17211d]/75" : "text-[#5c6660]"}`}>{t.label}</span>
                <span className="block text-xl leading-6 font-bold tracking-[-0.03em]">{t.value}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex shrink-0 items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          {filter === "all" ? "Stock overview" : filter === "low" ? "Running low" : "On the order list"}
        </h2>
        <span className="text-xs text-[#5c6660]">Worth {inr(value)} at cost</span>
      </div>

      <div className="no-scrollbar mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pb-3">
        {list.length === 0 && (
          <div className="py-8 text-center text-sm text-[#5c6660]">
            <p>{q ? `Nothing matches “${q}”.` : filter === "order" ? "Nothing on the order list yet." : "No parts running low."}</p>
            {(q || filter !== "all") && <button onClick={() => { setQ(""); setFilter("all"); }} className={`mt-2 ${btn.link}`}>Show all parts</button>}
          </div>
        )}
        {list.map((p) => {
          const t = qty(p), low = isLow(p), isOpen = open === p.id, jobs = usedIn(p.id);
          return (
            <div key={p.id} className="rounded-2xl border border-black/10 bg-white">
              <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${btn.focus}`}>
                <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${low ? "bg-[#ffe5d7] text-[#9a3412]" : "bg-[#e9ebe5]"}`}>{t}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className={`mt-0.5 block text-xs ${low ? "font-semibold text-[#9a3412]" : "text-[#5c6660]"}`}>
                    {low ? `Low · reorder at ${p.reorder}` : `${p.brands.length} brand${p.brands.length > 1 ? "s" : ""} · ${inr(p.price)} each`}
                  </span>
                </span>
                {p.toOrder && <span className="rounded-full bg-[#d9ff5c] px-2 py-1 text-[10px] font-bold">{p.ordered ? "ORDERED" : "TO ORDER"}</span>}
                <Icon name="chevron" className={`size-4 shrink-0 transition ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-black/10 px-3 pt-2 pb-3">
                  {p.brands.map((b) => (
                    <div key={b.brand} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-[#3f4943]">{b.brand}</span>
                      <span className="font-semibold">{b.qty}</span>
                    </div>
                  ))}
                  <p className="mt-1 text-xs text-[#5c6660]">Buy {inr(p.cost)} · sell {inr(p.price)} · reorder at {p.reorder}</p>
                  {jobs.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[#5c6660]">On open jobs:</span>
                      {jobs.map((j) => (
                        <button key={j.id} onClick={() => g.openJob(j.id)} className="rounded-full bg-[#e9ebe5] px-2.5 py-1 font-semibold hover:bg-[#dde0d8]">{j.plate}</button>
                      ))}
                    </div>
                  )}
                  {p.ordered ? (
                    <button onClick={() => g.receive(p.id)} className={`mt-3 w-full ${btn.secondary}`}>Delivery came · add to stock</button>
                  ) : (
                    <button
                      onClick={() => g.toggleOrder(p.id)}
                      className={`mt-3 h-11 w-full rounded-xl text-sm font-semibold transition ${btn.focus} ${p.toOrder ? "border border-black/15 bg-white" : "bg-[#17211d] text-white hover:bg-[#25332d]"}`}
                    >
                      {p.toOrder ? "Take off the order list" : "Add to order list"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Shared UI pieces: icons (from the Figma Make file), colours and button styles,
   the segmented control and the bottom sheet. Tabs use these so the same action
   always looks the same. */
import { useEffect, useRef, type ReactNode } from "react";

/** Colours. Text greys are chosen to pass WCAG AA on the light surfaces. */
export const C = {
  ink: "#17211d",
  lime: "#d9ff5c",
  page: "#f8f8f4",
  muted: "#5c6660",
  tint: "#e9ebe5",
  warn: "#ffe5d7",
  warnInk: "#9a3412",
  ok: "#3d7a00",
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17211d]";
export const btn = {
  primary: `flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#17211d] text-[15px] font-bold text-[#d9ff5c] transition hover:bg-[#25332d] disabled:bg-black/10 disabled:text-[#5c6660] ${focus}`,
  secondary: `flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold transition hover:bg-[#f0f1ec] disabled:text-[#5c6660] ${focus}`,
  dashed: `flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/30 bg-white text-sm font-semibold transition hover:bg-[#f0f1ec] ${focus}`,
  round: `grid size-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-[#f0f1ec] ${focus}`,
  link: `text-sm font-semibold underline underline-offset-4 ${focus}`,
  focus,
};

export type IconName =
  | "x"
  | "clock"
  | "user"
  | "rupee"
  | "undo"
  | "alert"
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

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
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
    x: <path d="M6 6l12 12M18 6 6 18" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    rupee: <path d="M6 4h12M6 9h12M9 4c6 0 6 9 0 9H6l8 7" />,
    undo: <path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />,
    alert: (
      <>
        <path d="M12 3 2 20h20z" />
        <path d="M12 10v4M12 17h.01" />
      </>
    ),
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

export function Seg<T extends string>({ options, value, onChange, label }: { options: T[]; value: T | ""; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid rounded-xl bg-[#e9ebe5] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`h-10 rounded-lg text-[13px] font-semibold transition ${focus} ${
            value === o ? "bg-white text-[#17211d] shadow-sm" : "text-[#5c6660] hover:text-[#17211d]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Bottom sheet: closes on the scrim, the Close button or Escape, and takes focus when it opens. */
export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[86%] flex-col rounded-t-3xl bg-[#f8f8f4] outline-none"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-2">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
          <button onClick={onClose} className={`h-10 rounded-full px-3 ${btn.link}`}>Close</button>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="shrink-0 border-t border-black/10 px-5 pt-3 pb-5">{footer}</div>}
      </div>
    </div>
  );
}

export function Plate({ plate, dark = false }: { plate: string; dark?: boolean }) {
  return <span className={`font-bold tracking-wide ${dark ? "text-white" : ""}`}>{plate}</span>;
}

export function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`text-xs font-semibold tracking-[0.08em] uppercase ${dark ? "text-white/60" : "text-[#5c6660]"}`}>{children}</p>;
}

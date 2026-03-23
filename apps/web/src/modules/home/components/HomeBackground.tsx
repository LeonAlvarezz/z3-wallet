import type { CSSProperties } from "react";

const BLOB_DELAYS: CSSProperties[] = [
  { animationDelay: "-4s" },
  { animationDelay: "-8s" },
  { animationDelay: "-2s" },
];

export function HomeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="animate-blob bg-primary/14 absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />
      <div
        className="animate-blob-alt absolute top-80 -right-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
        style={BLOB_DELAYS[0]}
      />
      <div
        className="animate-blob absolute bottom-32 -left-5 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl"
        style={BLOB_DELAYS[1]}
      />
      <div
        className="animate-blob-alt absolute right-1/4 bottom-80 h-44 w-44 rounded-full bg-violet-500/8 blur-2xl"
        style={BLOB_DELAYS[2]}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.12),transparent)]" />
    </div>
  );
}

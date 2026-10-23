const PATHS = {
  bag: "M5 8h14l-1 12H6L5 8Zm4 0V6.5a3 3 0 0 1 6 0V8",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L20 20",
  menu: "M3 7h18M3 12h18M3 17h12",
  close: "M6 6l12 12M18 6 6 18",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  "arrow-left": "M20 12H5m6-6-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "m5 12.5 4.5 4.5L19 7.5",
  alert: "M12 8v5m0 3.2v.3M12 3 2.5 20h19L12 3Z",
  ruler: "M3 15 15 3l6 6L9 21l-6-6Zm4-1 2 2m1-5 2 2m1-5 2 2",
  truck: "M2 7h11v9H2zM13 10h4l3 3v3h-7M6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  return: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  store: "M3 9.5 5 4h14l2 5.5M4 9.5V20h16V9.5M3 9.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5M10 20v-5h4v5",
  chat: "M4 5h16v11H9l-5 4V5Z",
  filter: "M4 6h16M7 12h10M10 18h4",
  zoom: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L20 20M10.5 8v5M8 10.5h5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "icon", label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

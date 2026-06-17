/* Icons — minimal lucide-style line icons */

window.Icon = function Icon({ name, size = 18, stroke = 1.6, ...rest }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case "user":
      return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>;
    case "heart":
      return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "cart":
      return <svg {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>;
    case "phone":
      return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case "truck":
      return <svg {...props}><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 3v5h-7"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/></svg>;
    case "clock":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "shield":
      return <svg {...props}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>;
    case "credit":
      return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "check":
      return <svg {...props}><path d="M20 6 9 17l-5-5"/></svg>;
    case "x":
      return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "plus":
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "minus":
      return <svg {...props}><path d="M5 12h14"/></svg>;
    case "chev-right":
      return <svg {...props}><path d="m9 18 6-6-6-6"/></svg>;
    case "chev-down":
      return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "arrow-right":
      return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "arrow-left":
      return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case "filter":
      return <svg {...props}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>;
    case "grid":
      return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "mail":
      return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>;
    case "pin":
      return <svg {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case "info":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case "lock":
      return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "package":
      return <svg {...props}><path d="m12 3 9 5v8l-9 5-9-5V8l9-5z"/><path d="m3.3 7.5 8.7 5 8.7-5M12 22V12.5"/></svg>;
    case "headset":
      return <svg {...props}><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 16v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2zM3 16v3a2 2 0 0 0 2 2h1v-7H5a2 2 0 0 0-2 2z"/></svg>;
    case "sparkle":
      return <svg {...props}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2"/></svg>;
    case "trash":
      return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>;
    case "globe":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>;
    case "menu":
      return <svg {...props}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
    case "edit":
      return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    /* Category icons */
    case "layers":
      return <svg {...props}><path d="m12 2 10 6-10 6L2 8l10-6z"/><path d="m2 14 10 6 10-6M2 11l10 6 10-6"/></svg>;
    case "needle":
      return <svg {...props}><path d="M18 2 22 6M16 4 20 8M3 21l8-8M8 14l2-2"/><path d="m11 13 5-5"/></svg>;
    case "braces":
      return <svg {...props}><path d="M3 12h2M19 12h2M7 8v8M11 6v12M13 6v12M17 8v8M7 8h10M7 16h10"/></svg>;
    case "tool":
      return <svg {...props}><path d="M14.7 6.3a4 4 0 0 1 5 5l-2.5-2.5-2.5 2.5-2.5-2.5 2.5-2.5zM3 21l8.7-8.7"/></svg>;
    case "drop":
      return <svg {...props}><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/></svg>;
    case "machine":
      return <svg {...props}><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9 10h6M9 14h4M2 12h2M20 12h2"/></svg>;
    case "screw":
      return <svg {...props}><path d="M12 2v4M9 6h6l-1 3H10zM10 9l-1 3h6l-1-3M9 15h6l-1 3h-4z"/><path d="M12 18v4"/></svg>;
    case "tooth":
      return <svg {...props}><path d="M7 5c-2 0-3.5 1.6-3.5 3.7 0 1.4.7 4.7 1.5 6.8.4 1.2.8 2.7 1.5 3.7.6 1 1.5 2 2.5 2 1.5 0 1.5-3 2-5 .4-1.4.5-1.7 1-1.7s.6.3 1 1.7c.5 2 .5 5 2 5 1 0 1.9-1 2.5-2 .7-1 1.1-2.5 1.5-3.7.8-2.1 1.5-5.4 1.5-6.8C20.5 6.6 19 5 17 5c-2.5 0-3.5 1.3-5 1.3S9.5 5 7 5z"/></svg>;
    case "drill":
      return <svg {...props}><path d="M3 12h6l3-3 3 3h6M12 9V4M9 18l3 3 3-3"/></svg>;
    case "scan":
      return <svg {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>;
    default:
      return null;
  }
};

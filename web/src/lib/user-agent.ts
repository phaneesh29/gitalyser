// Minimal user-agent parsing to give each session a human-readable device label.
// Good enough for a "your devices" list — not a full UA database.

export function describeDevice(ua: string | null | undefined): {
  browser: string;
  os: string;
  label: string;
} {
  if (!ua) return { browser: "Unknown", os: "Unknown device", label: "Unknown device" };

  const os = (() => {
    if (/Windows NT 10/.test(ua)) return "Windows";
    if (/Windows/.test(ua)) return "Windows";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Android/.test(ua)) return "Android";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown OS";
  })();

  const browser = (() => {
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\/|Opera/.test(ua)) return "Opera";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Safari\//.test(ua)) return "Safari";
    return "Browser";
  })();

  return { browser, os, label: `${browser} on ${os}` };
}

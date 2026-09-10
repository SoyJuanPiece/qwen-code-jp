const LOCALHOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function assertAllowedOutbound(
  endpoint: string,
  allowedEndpoints: string[],
): void {
  const target = new URL(endpoint);

  if (LOCALHOSTS.has(target.hostname)) {
    return;
  }

  const isAllowed = allowedEndpoints.some((raw) => {
    if (!raw) return false;
    const allowed = new URL(raw);
    return (
      allowed.protocol === target.protocol &&
      allowed.hostname === target.hostname &&
      String(allowed.port || defaultPort(allowed.protocol)) ===
        String(target.port || defaultPort(target.protocol))
    );
  });

  if (!isAllowed) {
    throw new Error(
      `Outbound request blocked by privacy policy: ${target.origin}`,
    );
  }
}

function defaultPort(protocol: string): string {
  return protocol === 'https:' ? '443' : '80';
}

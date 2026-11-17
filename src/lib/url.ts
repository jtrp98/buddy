function parseSafeHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  const first = rawHost.split(",")[0]?.trim();
  if (!first) return null;
  if (/[\s/@\\?#]/.test(first)) return null;
  return first;
}

function isLocalHost(host: string): boolean {
  const withoutPort = host.startsWith("[")
    ? host.replace(/:\d+$/, "").toLowerCase()
    : host.replace(/:\d+$/, "").toLowerCase();
  return (
    withoutPort === "localhost" ||
    withoutPort === "127.0.0.1" ||
    withoutPort === "[::1]" ||
    withoutPort.endsWith(".local")
  );
}

function resolveRequestProtocol(req: Request, host: string): "http" | "https" {
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (forwardedProto === "http" || forwardedProto === "https") {
    return forwardedProto;
  }

  try {
    const parsedUrl = new URL(req.url);
    const urlProto = parsedUrl.protocol.replace(/:$/, "").toLowerCase();
    // Only trust req.url's protocol when the request wasn't rewritten from a different proxy host
    if (
      (urlProto === "http" || urlProto === "https") &&
      parsedUrl.host.toLowerCase() === host.toLowerCase()
    ) {
      return urlProto;
    }
  } catch {
    // Ignore invalid or relative req.url
  }

  return isLocalHost(host) ? "http" : "https";
}

function extractRequestOrigin(req: Request): string | null {
  let host =
    parseSafeHost(req.headers.get("x-forwarded-host")) ||
    parseSafeHost(req.headers.get("host"));

  if (!host) {
    try {
      host = parseSafeHost(new URL(req.url).host);
    } catch {
      host = null;
    }
  }

  if (!host) return null;

  const proto = resolveRequestProtocol(req, host);
  try {
    // Validate constructed origin
    const candidate = `${proto}://${host}`;
    new URL(candidate);
    return candidate.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function normalizeOrigin(urlOrHost: string): string {
  const trimmed = urlOrHost.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getAppBaseUrl(req?: Request): string {
  if (req) {
    const requestOrigin = extractRequestOrigin(req);
    if (requestOrigin) {
      return requestOrigin;
    }
  }

  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (process.env.VERCEL_URL?.trim()) {
    return normalizeOrigin(process.env.VERCEL_URL);
  }
  return "http://localhost:3000";
}

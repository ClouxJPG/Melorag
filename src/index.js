export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Nowcast Worker OK", {
        headers: {
          ...cors,
          "Content-Type": "text/plain; charset=UTF-8"
        }
      });
    }

    if (url.pathname !== "/nowcast") {
      return new Response("Not found", {
        status: 404,
        headers: cors
      });
    }

    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url=", {
        status: 400,
        headers: cors
      });
    }

    let targetURL;

    try {
      targetURL = new URL(target);
    } catch {
      return new Response("Invalid URL", {
        status: 400,
        headers: cors
      });
    }

    if (
      targetURL.protocol !== "https:" ||
      targetURL.hostname !== "www.nowcast.ru" ||
      targetURL.pathname !== "/baltrad_wsgi"
    ) {
      return new Response("Forbidden target", {
        status: 403,
        headers: cors
      });
    }

    const r = await fetch(targetURL.toString());

    const headers = new Headers(cors);
    headers.set(
      "Content-Type",
      r.headers.get("Content-Type") || "application/octet-stream"
    );

    return new Response(r.body, {
      status: r.status,
      headers
    });
  }
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Nowcast Worker OK", {
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      });
    }

    if (url.pathname === "/test") {
      return new Response(
        JSON.stringify({
          ok: true,
          worker: "melorag",
          nowcast: "proxy-ready"
        }),
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    if (url.pathname !== "/nowcast") {
      return new Response("Not found", { status: 404 });
    }

    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing url parameter", { status: 400 });
    }

    let targetURL;

    try {
      targetURL = new URL(target);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    if (
      targetURL.protocol !== "https:" ||
      targetURL.hostname !== "www.nowcast.ru" ||
      targetURL.pathname !== "/baltrad_wsgi"
    ) {
      return new Response("Forbidden target", { status: 403 });
    }

    const response = await fetch(targetURL.toString(), {
      method: "GET"
    });

    const headers = new Headers(response.headers);

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};

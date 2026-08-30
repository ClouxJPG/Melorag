export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Nowcast Worker OK", {
        headers: {
          "content-type": "text/plain; charset=UTF-8"
        }
      });
    }

    if (url.pathname !== "/nowcast") {
      return new Response("Not found", { status: 404 });
    }

    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url=", { status: 400 });
    }

    if (!target.startsWith("https://www.nowcast.ru/baltrad_wsgi")) {
      return new Response("Forbidden target", { status: 403 });
    }

    const response = await fetch(target, {
      method: "GET"
    });

    const headers = new Headers(response.headers);

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};

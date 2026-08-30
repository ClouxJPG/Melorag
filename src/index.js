const NOWCAST = "https://www.nowcast.ru";

export default {
  async fetch(request) {

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-store"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors
      });
    }

    try {

      const incoming =
        new URL(request.url);

      const target =
        incoming.searchParams.get("url");

      if (!target) {

        return new Response(
          JSON.stringify({
            ok: true,
            worker: "melorag",
            nowcast: "proxy-ready"
          }),
          {
            status: 200,
            headers: {
              ...cors,
              "Content-Type":
                "application/json"
            }
          }
        );

      }

      const u =
        new URL(target);

      /*
       * Разрешаем только Nowcast.
       */

      if (
        u.hostname !== "www.nowcast.ru" &&
        u.hostname !== "nowcast.ru"
      ) {

        return new Response(
          "Forbidden target",
          {
            status: 403,
            headers: cors
          }
        );

      }

      /*
       * Получаем свежий токен.
       */

      const tokenResponse =
        await fetch(
          NOWCAST + "/get_token",
          {
            method: "GET",

            headers: {
              "User-Agent":
                "Mozilla/5.0"
            }
          }
        );

      if (!tokenResponse.ok) {

        return new Response(
          "Nowcast token error: " +
          tokenResponse.status,
          {
            status: 502,
            headers: cors
          }
        );

      }

      const tokenData =
        await tokenResponse.json();

      if (!tokenData.token) {

        return new Response(
          "Nowcast token missing",
          {
            status: 502,
            headers: cors
          }
        );

      }

      /*
       * Убираем старый token.
       */

      u.searchParams.delete(
        "token"
      );

      /*
       * Добавляем свежий.
       */

      u.searchParams.set(
        "token",
        tokenData.token
      );

      /*
       * Запрос к настоящему Nowcast.
       */

      const response =
        await fetch(
          u.toString(),
          {
            method: "GET",

            headers: {
              "User-Agent":
                "Mozilla/5.0",

              "Accept":
                "image/png,image/*,*/*"
            }
          }
        );

      const headers =
        new Headers(cors);

      headers.set(
        "Content-Type",
        response.headers.get(
          "content-type"
        ) ||
        "application/octet-stream"
      );

      headers.set(
        "Cache-Control",
        "no-store"
      );

      return new Response(
        response.body,
        {
          status:
            response.status,

          headers
        }
      );

    } catch (error) {

      return new Response(
        JSON.stringify({
          ok:false,
          error:String(error)
        }),
        {
          status:500,

          headers:{
            ...cors,

            "Content-Type":
              "application/json"
          }
        }
      );

    }

  }
};

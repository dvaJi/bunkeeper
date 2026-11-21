const server = Bun.serve({
  port: Bun.env.PORT ?? 4173,
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./dist${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(await Bun.file("./dist/index.html").text(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`preview -> http://localhost:${server.port}`);

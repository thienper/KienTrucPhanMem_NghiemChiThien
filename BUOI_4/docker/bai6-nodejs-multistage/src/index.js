const http = require("http");

const port = 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from multi-stage Node.js app");
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`App is running at ${port}`);
  });

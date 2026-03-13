const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, Docker!");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

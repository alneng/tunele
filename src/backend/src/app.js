const server = require("./index");

const PORT = process.env.PORT || 7600;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});

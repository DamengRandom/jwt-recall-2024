const redis = require("redis");

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

client.connect();

client.on("connect", () => {
  console.log("Redis Client connected with redis server ..");
});

client.on("ready", () => {
  console.log("Redis Client is ready to be used ..");
});

client.on("error", (error) => {
  console.log(
    "Error detected during connecting redis server ..",
    error?.message
  );
});

client.on("end", () => {
  console.log("Redis Client disconnected with redis server ..");
});

process.on("SIGINT", () => {
  client.quit();

  process.exit(0);
});

module.exports = client;

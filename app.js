const express = require("express");
const morgan = require("morgan");
// const createError = require("http-errors");
const AuthRoutes = require("./Routes/Auth.routes");
const { verifyAccessToken } = require("./helpers/jwt_helper");
const client = require("./helpers/init_redis");

require("./helpers/init_mongodb");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4653;

// How to use redis client?
client.SET("TestKey", "TestValue");
client.GET("TestKey", (error, value) => {
  if (error) console.log(error);

  console.log(value);
});

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API test routes
app.get("/v1/test", verifyAccessToken, async (req, res, next) => {
  try {
    return res.send("Test response ..");
  } catch (error) {
    return res.status(error?.status || 500).json({ error });
  }
});

app.use("/v1/auth", AuthRoutes);

// // Generate a default route
// app.use((req, res, next) => {
//   // const error = new Error("Route not found");
//   // error.status = 404;
//   // next(error);

//   next(createError.NotFound("Route not found .."));
// });

// Generate a error handler middleware
// app.use((err, req, res, next) => {
//   if (err)
//     res.send({
//       error: {
//         status: err?.status || 500,
//         message: err?.message || "Route is not reachable",
//       },
//     });

// });

app.listen(PORT, () => {
  console.info(`App started with port: ${PORT}`);
});

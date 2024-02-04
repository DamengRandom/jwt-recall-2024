const express = require("express");
const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");

require("dotenv").config();

const mongoClient = require("../helpers/init_mongodb");
const { authUserSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");

const router = express.Router();

// routes
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const jwtAuthDB = (await mongoClient()).db(process.env.MONGO_DB_NAME);
    const users = jwtAuthDB.collection("user");
    const existedUser = await users.findOne({ email });
    // hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // do user inputs validation check
    await authUserSchema.validateAsync(req.body);

    // check user existence
    if (existedUser?.email === email)
      throw createHttpError.Conflict(`${email} had already been registered ..`);

    // data insertion
    users.insertOne({ email, password: hashedPassword });

    // generate jwt token access token
    const refreshToken = await signRefreshToken(result.email);

    res.status(201).send({
      message: "User created",
      data: { email, password: hashedPassword },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log("User registration error: ", error);

    if (error.isJoi) error.status = 422;

    res.status(error?.status || 500).send({ error });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // do user inputs validation check
    const result = await authUserSchema.validateAsync(req.body);
    // initial mongodb client collection
    const jwtAuthDB = (await mongoClient()).db(process.env.MONGO_DB_NAME);
    const users = jwtAuthDB.collection("user");
    const existedUser = await users.findOne({ email: result.email });
    // check if user registered already
    if (!existedUser) throw createHttpError.BadRequest("User not found ..");
    // check if user input password is matching with db saved version or not
    const isPasswordMatched = await bcrypt.compare(
      result.password,
      existedUser.password
    );

    if (!isPasswordMatched)
      throw createHttpError.Unauthorized("Password incorrect ..");

    const accessToken = await signAccessToken(result.email);
    const refreshToken = await signRefreshToken(result.email);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error: ", error);

    if (error.isJoi)
      res
        .status(400)
        .send(createHttpError.BadRequest("Invalid username or password .."));

    res.status(error?.status || 500).send({ error: error.toString() });
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) throw createHttpError.BadRequest();

    const { user } = await verifyRefreshToken(refreshToken);

    const newAccessToken = await signAccessToken(user);
    const newRefreshToken = await signRefreshToken(user);

    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.send(error);
  }
});

router.delete("/logout", async (req, res, next) => {
  res.send("logout route");
});

module.exports = router;

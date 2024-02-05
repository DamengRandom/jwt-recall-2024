const express = require("express");
const router = express.Router();

require("dotenv").config();

const {
  register,
  login,
  refreshToken,
  logout,
} = require("../Controllers/Auth.controller");

// routes
router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.delete("/logout", logout);

module.exports = router;

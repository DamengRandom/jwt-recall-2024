const JWT = require("jsonwebtoken");
const createHttpError = require("http-errors");

const client = require("../helpers/init_redis");

require("dotenv").config();

module.exports = {
  signAccessToken: (userEmail) => {
    return new Promise((resolve, reject) => {
      const payload = {
        // iss: "https://damengrandom.vercel.app", // PLEASE DO NOT PUT IN, OTHERWISE, WILL GET CONFLICT ERROR SINCE issuer HAS BEEN DEFINED INSIDE options !!!!!
      };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "15s",
        issuer: "https://damengrandom.vercel.app", // JWT token issuer - is the party that "created" the token and signed it with its private key.
        audience: userEmail,
      };

      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.error("JWT Error: ", err);
          reject(createHttpError.InternalServerError(err));
        }

        client.set(
          userEmail,
          token,
          { EX: 365 * 24 * 60 * 60 },
          (err, reply) => {
            if (err) {
              console.error("Redis SET token error: ", err);

              reject(createHttpError.InternalServerError(err));

              return;
            }
          }
        );

        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) {
      console.error("JWT Unauthorized Error: ", err);
      next(createHttpError.Unauthorized(err));
    }

    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");

    const token = bearerToken[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
      if (error)
        return res
          .status(401)
          .send(
            createHttpError.Unauthorized(
              error?.message || "JWT token invalid .."
            )
          );

      req.payload = payload;

      return next();
    });
  },
  signRefreshToken: (userEmail) => {
    return new Promise((resolve, reject) => {
      const payload = {
        // iss: "https://damengrandom.vercel.app", // PLEASE DO NOT PUT IN, OTHERWISE, WILL GET CONFLICT ERROR SINCE issuer HAS BEEN DEFINED INSIDE options !!!!!
      };
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "https://damengrandom.vercel.app", // JWT token issuer - is the party that "created" the token and signed it with its private key.
        audience: userEmail,
      };

      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.error("JWT Error: ", err);
          reject(createHttpError.InternalServerError(err));
        }

        resolve(token);
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, payload) => {
          if (error) return reject(createHttpError.Unauthorized(error));
          const userEmail = payload.aud;

          resolve({ user: userEmail });
        }
      );
    });
  },
};

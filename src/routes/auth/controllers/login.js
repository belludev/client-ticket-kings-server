const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const jwt = require("jsonwebtoken");
const apiResponse = require("../../../utilities/api-responses");
const bcrypt = require("bcrypt");

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password must be specified."),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        const user = await User.findOne({
          attributes: ["email", "password", "uid", "confirmed"],
          where: {
            email: req.body.email
          }
        });
        if (user) {
          bcrypt.compare(req.body.password, user.password, (err, same) => {
            if (same) {
              if (user.confirmed) {
                let userData = {
                  uid: user.uid,
                  email: user.email
                };
                const jwtPayload = userData;
                const jwtData = {
                  expiresIn: process.env.JWT_TIMEOUT_DURATION
                };
                const secret = process.env.JWT_SECRET;
                //Generated JWT token with Payload and secret.
                userData.token = jwt.sign(jwtPayload, secret, jwtData);
                return apiResponse.successResponseWithData(
                  res,
                  "Login Success.",
                  userData
                );
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Account is not confirmed. Please confirm your account."
                );
              }
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Email or Password wrong."
              );
            }
          });
        } else {
          return apiResponse.unauthorizedResponse(
            res,
            "Email or Password wrong."
          );
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

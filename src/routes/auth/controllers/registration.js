// const UserModel = require("../models/User");
const User = require("../models/User");
const { body, validationResult, sanitizeBody } = require("express-validator");

//helper file to prepare responses.
const apiResponse = require("../../../utilities/api-responses");
const utility = require("../../../utilities/random");
const bcrypt = require("bcrypt");
const mailer = require("../../../utilities/mailer");
const { constants } = require("../../../utilities/constants");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 * @param {string}      confirmPassword
 *
 * @returns {Object}
 */
exports.register = [
  // Validate fields.
  body("firstName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("lastName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Last name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .custom(value => {
      // Checks to see if the user already exists in the database
      return User.findOne({
        attributes: ["email"],
        where: { email: value }
      }).then(user => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .withMessage("Password must be 6 characters or greater."),

  // Sanitize fields.
  sanitizeBody("firstName").escape(),
  sanitizeBody("lastName").escape(),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape(),

  // Process request after validation and sanitization.
  async (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //hash input password
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
          // generate OTP for confirmation
          let otp = utility.randomNumber(8);
          // Create User object with escaped and trimmed data
          const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            otp: otp
          });
          console.log(`User ${user.uid}: created`);
          // Html email body
          let html =
            "<p>Please confirm your Account.</p><p>OTP: " + otp + "</p>";
          // Send confirmation email
          mailer
            .send(
              constants.confirmEmails.from,
              req.body.email,
              "Confirm Account",
              html
            )
            .then(function() {
              // Save user.
              // user.save(function(err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              }
              let userData = {
                uid: user.uid,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
              };
              return apiResponse.successResponseWithData(
                res,
                "Registration Success.",
                userData
              );
              // });
            })
            .catch(err => {
              console.log(err);
              return apiResponse.ErrorResponse(res, err);
            });
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

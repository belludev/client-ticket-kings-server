// const UserModel = require("../models/User");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../../../utilities/api-responses");

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.confirmEmail = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("otp")
    .isLength({ min: 1 })
    .trim()
    .withMessage("OTP must be specified."),
  sanitizeBody("email").escape(),
  sanitizeBody("otp").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var { email } = req.body;
        User.findOne({
          attributes: ["email", "otp", "confirmed"],
          where: {
            email: email
          }
        }).then(user => {
          if (user) {
            //Check already confirm or not.
            if (!user.confirmed) {
              //Check account confirmation.
              if (user.otp == req.body.otp) {
                //Update user as confirmed
                User.update(
                  {
                    confirmed: true,
                    otp: null
                  },
                  {
                    where: {
                      email: req.body.email
                    }
                  }
                )
                  .then(() => {
                    return apiResponse.successResponse(
                      res,
                      "Account confirmed success."
                    );
                  })
                  .catch(err => {
                    return apiResponse.ErrorResponse(res, err);
                  });
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Otp does not match"
                );
              }
            } else {
              return apiResponse.unauthorizedResponse(
                res,
                "Account already confirmed."
              );
            }
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Specified email not found."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

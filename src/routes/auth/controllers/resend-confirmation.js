const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../../../utilities/api-responses");
const utility = require("../../../utilities/random");
const mailer = require("../../../utilities/mailer");
const { constants } = require("../../../utilities/constants");

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  sanitizeBody("email").escape(),
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
        const { email } = req.body;
        const user = await User.findOne({
          attributes: ["email", "confirmed"],
          where: {
            email: email
          }
        });
        if (user) {
          if (!user.confirmed) {
            let otp = utility.randomNumber(8);
            let html =
              "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
            // Send confirmation email
            mailer
              .send(
                constants.confirmEmails.from,
                req.body.email,
                "Confirm Account",
                html
              )
              .then(function() {
                User.update(
                  {
                    confirmed: false,
                    otp
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
                      "Confirm otp sent."
                    );
                  })
                  .catch(err => {
                    return apiResponse.ErrorResponse(res, err);
                  });
              });
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Account already confirmed"
            );
          }
        } else {
          return apiResponse.unauthorizedResponse(
            res,
            "Specified email not found."
          );
        }

        // UserModel.findOne(query).then(user => {
        //   if (user) {
        //     //Check already confirm or not.
        //     if (!user.isConfirmed) {
        //       // Generate otp
        //       let otp = utility.randomNumber(4);
        //       // Html email body
        //       let html =
        //         "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
        //       // Send confirmation email
        //       mailer
        //         .send(
        //           constants.confirmEmails.from,
        //           req.body.email,
        //           "Confirm Account",
        //           html
        //         )
        //         .then(function() {
        //           user.isConfirmed = 0;
        //           user.confirmOTP = otp;
        //           // Save user.
        //           user.save(function(err) {
        //             if (err) {
        //               return apiResponse.ErrorResponse(res, err);
        //             }
        //             return apiResponse.successResponse(
        //               res,
        //               "Confirm otp sent."
        //             );
        //           });
        //         });
        //     } else {
        //       return apiResponse.unauthorizedResponse(
        //         res,
        //         "Account already confirmed."
        //       );
        //     }
        //   } else {
        //     return apiResponse.unauthorizedResponse(
        //       res,
        //       "Specified email not found."
        //     );
        //   }
        // });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

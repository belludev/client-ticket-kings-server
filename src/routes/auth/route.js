const express = require("express");
const { confirmEmail } = require("./controllers/account-verification");
const { resendConfirmOtp } = require("./controllers/resend-confirmation");
const { register } = require("./controllers/registration");
const { login } = require("./controllers/login");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-registration", confirmEmail);
router.post("/resend-confirmation", resendConfirmOtp);

module.exports = router;

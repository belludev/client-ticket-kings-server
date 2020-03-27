var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index/route");
var apiRouter = require("./routes/api");
var apiResponse = require("./utilities/api-responses");
var cors = require("cors");

var app = express();

// DB
const db = require("./utilities/db");
db.sequelize
  .sync()
  .then(() => {
    console.log("DB Synced and connected");
  })
  .catch(console.error);

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/", indexRouter);
app.use("/api", apiRouter);

// JWT unauth handler
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    apiResponse.unauthorizedResponse(res, "Invalid Token.");
  } else {
    next();
  }
});

// throw 404 if URL not found
app.all("*", function(req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

module.exports = app;

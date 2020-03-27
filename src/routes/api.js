const express = require("express");
const indexRouter = require("./index/route");
const authRouter = require("./auth/route");
// const bookRouter = require("./book/route");
// const webhooksRouter = require("./webhooks/route");

const app = express();

app.use("/", indexRouter);
app.use("/auth", authRouter);
// app.use("/book", bookRouter);
// app.use("/webhooks", webhooksRouter);

module.exports = app;

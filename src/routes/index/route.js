var express = require("express");
var router = express.Router();
const auth = require("../../middleware/jwt");

/* GET home page. */
router.get("/", auth, function(req, res) {
  res.json({
    version: 1,
    company: "Ticket Kings",
    description:
      "TicketKings is a Discord-based community focused on buying and selling tickets to concerts, plays, games, and more."
  });
});

module.exports = router;

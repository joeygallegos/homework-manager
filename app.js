var express = require("express")
var app = express()
var server = app.listen(3000, function() {
  console.log("Server running on port %d", server.address().port)
})

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.set("view cache", true)
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.send('Hello World!')
})

app.use(function (req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

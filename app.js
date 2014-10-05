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
  res.send("Index")
})

app.get("/list", function (req, res) {
  res.render("list", {title: "Homework List"})
})

app.get("/manage", function (req, res) {
  res.render("manage", {title: "Discipline Management"})
})

app.use(function (req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

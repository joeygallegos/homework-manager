var express = require("express")
var monk = require("monk")

var APIResponse = require("./lib/APIResponse")

var app = express()
var db = monk("localhost:27017/homework-manager")
var server = app.listen(3000, function() {
  console.log("Server running on port %d", server.address().port)
})

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.set("view cache", true)
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.redirect("/list") //temporary redirect
})

app.get("/list", function(req, res) {
  res.render("list", {title: "Homework List"})
})

app.get("/manage", function(req, res) {
  var collection = db.get("disciplines")
  collection.find({}, function(err, doc) {
    if (err) {
      return res.render("manage", {title: "Discipline Management", disciplines: "error"});
    }

    if (doc.length > 0) {
      res.render("manage", {title: "Discipline Management", disciplines: doc})
    } else {
      res.render("manage", {title: "Discipline Management", disciplines: "empty"})
    }
  })
})

app.get("/api/discipline/add", function(req, res) {
  var response = new APIResponse()
  var name = req.param("name")
  var label = req.param("label")

  var collection = db.get("disciplines")
  collection.find({$or: [{label: label}, {name: name}]}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    if (doc.length > 0) {
      response.setResponse("error", "The label or the discipline already exists!")
      response.sendResponse(res)
    } else {
      collection.insert({label: label, name: name}, function(err, doc) {
        if (err) {
          response.setResponse("error", err.message)
          return response.sendResponse(res)
        }

        response.setResponse("success", "Discipline added!")
        response.sendResponse(res)
      })
    }
  })
})

app.use(function(req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

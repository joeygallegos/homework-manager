var express = require("express")
var monk = require("monk")
var bodyParser = require("body-parser")

var APIResponse = require("./lib/APIResponse")
var utils = require("./lib/Utils")

var app = express()
var db = monk("localhost:27017/homework-manager")
var server = app.listen(3000, function() {
  console.log("Server running on port %d", server.address().port)
})

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.set("view cache", true)
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}))

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
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/discipline/add", function(req, res) {
  var response = new APIResponse()
  var label = req.param("label")
  var name = req.param("name")

  if (utils.isEmpty(label) || utils.isEmpty(name)) {
    response.setResponse("error", "Something is empty!")
    return response.sendResponse(res)
  }

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

app.get("/api/discipline/get", function(req, res) {
  var collection = db.get("disciplines")
  collection.find({}, function(err, doc) {
    if (err) {
      return res.render("manage-list", {disciplines: "error"});
    }

    if (doc.length > 0) {
      res.render("manage-list", {disciplines: doc})
    } else {
      res.render("manage-list", {disciplines: "empty"})
    }
  })
})

app.post("/api/discipline/get", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/discipline/remove", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/discipline/remove", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")

  if (utils.isEmpty(id)) {
    response.setResponse("error", "An error occurred!")
    return response.sendResponse(res)
  }

  var collection = db.get("disciplines")
  id = collection.id(id)

  collection.findAndModify({_id: id}, {}, {remove: true}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    response.setResponse("success", "Discipline removed!")
    response.sendResponse(res)
  })
})

app.use(function(req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

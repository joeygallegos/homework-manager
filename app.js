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
  var collection = db.get("homework")
  var homework = "error"
  var subjects = "error"

  collection.find({}, {sort: {done: 1, date: 1}}, function(err, doc) {
    if (err) {
      homework = "error"
    } else {
      if (doc.length > 0) {
        homework = doc
      } else {
        homework = "empty"
      }

      collection = db.get("subjects")
      collection.find({}, function(err, doc) {
        if (!err) {
          if (doc.length > 0) {
            subjects = doc
          } else {
          subjects = "empty"
          }
        }

        res.render("list", {title: "Homework List", data: homework, subjects: subjects})
      })
    }
  })
})

app.get("/manage", function(req, res) {
  var collection = db.get("subjects")
  collection.find({}, function(err, doc) {
    if (err) {
      return res.render("manage", {title: "Subject Management", data: "error", subjects: "error"})
    }

    if (doc.length > 0) {
      var subjects = doc
      collection.find({}, function(err, doc) {
        if (err) {
          return res.render("manage", {title: "subject Management", data: subjects, subjects: "error"})
        }

        if (doc.length > 0) {
          res.render("manage", {title: "Subject Management", data: subjects, subjects: doc})
        } else {
          res.render("manage", {title: "Subject Management", data: subjects, subjects: "empty"})
        }
      })
    } else {
      res.render("manage", {title: "Subject Management", data: "empty", subjects: "empty"})
    }
  })
})

app.get("/api/subject/add", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/add", function(req, res) {
  var response = new APIResponse()
  var label = req.param("label")
  var name = req.param("name")

  if (utils.isEmpty(label) || utils.isEmpty(name)) {
    response.setResponse("error", "Something is empty!")
    return response.sendResponse(res)
  }

  var collection = db.get("subjects")
  collection.find({$or: [{label: label}, {name: name}]}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    if (doc.length > 0) {
      response.setResponse("error", "The label or the subject already exists!")
      response.sendResponse(res)
    } else {
      collection.insert({label: label, name: name}, function(err, doc) {
        if (err) {
          response.setResponse("error", err.message)
          return response.sendResponse(res)
        }

        response.setResponse("success", "Subject added!")
        response.sendResponse(res)
      })
    }
  })
})

app.get("/api/subject/get", function(req, res) {
  var response = new APIResponse()
  var lite = req.param("lite")
  var template = "subjects-list"

  if (!utils.isEmpty(lite))
    template = "subjects-list-lite"

  var collection = db.get("subjects")
  collection.find({}, function(err, doc) {
    if (err) {
      return res.render(template, {subjects: "error"});
    }
    
    if (doc.length > 0) {
      res.render(template, {subjects: doc})
    } else {
      res.render(template, {subjects: "empty"})
    }
  })
})

app.post("/api/subject/get", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/subject/remove", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/remove", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")

  if (utils.isEmpty(id)) {
    response.setResponse("error", "An error occurred!")
    return response.sendResponse(res)
  }

  var collection = db.get("subjects")
  id = collection.id(id)

  collection.findAndModify({_id: id}, {}, {remove: true}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    response.setResponse("success", "Subject removed!")
    response.sendResponse(res)
  })
})

app.get("/api/subject/edit", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/edit", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")
  var label = req.param("label")
  var name = req.param("name")

  if (utils.isEmpty(id) || utils.isEmpty(label) || utils.isEmpty(name)) {
    response.setResponse("error", "An error occurred!")
    return response.sendResponse(res)
  }

  var collection = db.get("subjects")
  id = collection.id(id)

  collection.update({_id: id}, {label: label, name: name}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    response.setResponse("success", "Subject edited!")
    response.sendResponse(res)
  })
})

app.get("/api/homework/add", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/add", function(req, res) {
  var response = new APIResponse()
  var date = req.param("date")
  var subject = req.param("subject")
  var description = req.param("description")

  if (utils.isEmpty(date) || utils.isEmpty(subject) || utils.isEmpty(description)) {
    response.setResponse("error", "Something is empty!")
    return response.sendResponse(res)
  }

  var collection = db.get("homework")
  collection.insert({date: date, subject: subject, description: description, done: false}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    response.setResponse("success", "Homework added!")
    response.sendResponse(res)
  })
})

app.get("/api/homework/get", function(req, res) {
  var count = req.param("count")

  var collection = db.get("homework")
  collection.find({}, {sort: {done: 1, date: 1}}, function(err, doc) {
    if (err) {
      return res.render("homework-list", {data: "error"});
    }

    if (!utils.isEmpty(count)) {
      collection.find({done: false}, function(err, doc) {
        if (err) {
          return res.render("homework-list", {data: "error"});
        }

        res.send("" + doc.length)
      })
    } else {
      if (doc.length > 0) {
        res.render("homework-list", {data: doc})
      } else {
        res.render("homework-list", {data: "empty"})
      }
    }
  })
})

app.post("/api/homework/get", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/homework/toggle", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/toggle", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")

  if (utils.isEmpty(id)) {
    response.setResponse("error", "An error occurred!")
    return response.sendResponse(res)
  }

  var collection = db.get("homework")
  id = collection.id(id)
  collection.findOne({_id: id}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    var status = !doc.done
    collection.findAndModify({_id: id}, {$set: {done: status}}, function(err, doc) {
      if (err) {
        response.setResponse("error", err.message)
        return response.sendResponse(res)
      }

      response.setResponse("success", "Homework status changed!")
      response.sendResponse(res)
    })
  })
})

app.get("/api/homework/edit", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/edit", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")
  var date = req.param("date")
  var subject = req.param("subject")
  var description = req.param("description")

  if (utils.isEmpty(id) || utils.isEmpty(date) || utils.isEmpty(subject) || utils.isEmpty(description)) {
    response.setResponse("error", "An error occurred!")
    return response.sendResponse(res)
  }

  var collection = db.get("homework")
  id = collection.id(id)

  collection.update({_id: id}, {$set: {date: date, subject: subject, description: description}}, function(err, doc) {
    if (err) {
      response.setResponse("error", err.message)
      return response.sendResponse(res)
    }

    response.setResponse("success", "Homework edited!")
    response.sendResponse(res)
  })
})


app.use(function(req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

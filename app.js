var utils = require("./lib/Utils")
var config = require("./config")
var SHA256 = require("crypto-js/SHA256")

if (!config.password.encrypted) {
  var password = config.password.value
  var salt = new Date().getTime()

  if (password == "")
    return console.log("Please open the file \"config.js\" and enter your password on the \"config.password.value\" variable!")

  console.log("It seems that your password isn't encrypted!")
  console.log("Your unencrypted password is: " + password)
  console.log("Please open the file \"config.js\" and modify the following variables to the following values:")
  console.log("config.password.encrypted = true")
  console.log("config.password.value = \"" + SHA256(password + salt) + "\"")
  console.log("config.password.salt = \"" + salt + "\"")
  return;
}

var express = require("express")
var monk = require("monk")
var bodyParser = require("body-parser")
var session = require("express-session")

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
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({secret: new Date().getTime().toString(), resave: true, saveUninitialized: true}))

app.get("/", function(req, res) {
  if (!req.session.isLogged)
    return res.redirect("/login")
  else
    return res.redirect("/list")
})

app.get("/login", function(req, res) {
  if (req.session.isLogged)
    return res.redirect("/list")

  res.render("login", {title: "Login"})
})

app.get("/list", function(req, res) {
  if (!req.session.isLogged)
    return res.redirect("/login")

  res.render("list", {title: "Homework List"})
})

app.get("/manage", function(req, res) {
  if (!req.session.isLogged)
    return res.redirect("/login")

  res.render("manage", {title: "Subject Management"})
})

app.get("/api/login", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/login", function(req, res) {
  var response = new APIResponse()
  if (req.session.isLogged) {
    response.setResponse("error", "User already logged in!")
    return response.sendResponse(res)
  }

  var password = req.param("password")

  if (utils.isEmpty(password)) {
    response.setResponse("error", "The provided password is empty.")
    return response.sendResponse(res)
  }

  password = SHA256(password + config.password.salt)

  if (password == config.password.value) {
    req.session.isLogged = true
    response.setResponse("success", "User logged in!")
    response.sendResponse(res)
  } else {
    response.setResponse("error", "The provided password is wrong.")
    return response.sendResponse(res)
  }
})

app.get("/api/logout", function(req, res) {
  req.session.destroy()
  res.write("Successfully logged out.")
  res.end()
})

app.post("/api/logout", function(req, res) {
  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/subject/add", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/add", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/subject/remove", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/remove", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/subject/edit", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/add", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts GET requests.")
  response.sendResponse(res)
})

app.get("/api/homework/toggle", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/toggle", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

  var response = new APIResponse()
  response.setResponse("critical", "This feature only accepts POST requests.")
  response.sendResponse(res)
})

app.post("/api/homework/edit", function(req, res) {
  if (!req.session.isLogged) {
    return res.redirect("/login")
  }

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

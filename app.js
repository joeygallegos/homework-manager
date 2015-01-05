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
  return
}

var express = require("express")
var monk = require("monk")
var bodyParser = require("body-parser")
var session = require("express-session")
var ejs = require("ejs")

var APIResponse = require("./lib/APIResponse")
var APIStatus = new APIResponse().status
var APIResponses = new APIResponse().responses

var APIManager = require("./lib/APIManager")
APIManager = new APIManager()
var APIMethods = APIManager.methods

var app = express()
var db = monk("localhost:27017/homework-manager")
var server = app.listen(3000, function() {
  console.log("Server running on port %d", server.address().port)
})

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.set("view cache", true)
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({secret: new Date().getTime().toString(), resave: true, saveUninitialized: true}))

APIManager.registerPage("login", APIManager.methods.POST, false)
APIManager.registerPage("logout", APIManager.methods.GET, true)
APIManager.registerPage("subject/add", APIManager.methods.POST, true)
APIManager.registerPage("subject/get", APIManager.methods.GET, true)
APIManager.registerPage("subject/remove", APIManager.methods.POST, true)
APIManager.registerPage("subject/edit", APIManager.methods.POST, true)
APIManager.registerPage("homework/add", APIManager.methods.POST, true)
APIManager.registerPage("homework/get", APIManager.methods.GET, true)
APIManager.registerPage("homework/toggle", APIManager.methods.POST, true)
APIManager.registerPage("homework/edit", APIManager.methods.POST, true)

app.all("*", function(req, res, next) {
  var path = req.path

  if (path.indexOf("/api/") > -1) {
    var page = APIManager.getPage(path)
    var method = req.method
    var token = req.param("token")

    if (page != null)
      if (page.method == method) {
        if (page.auth == true) {
          if (utils.isEmpty(token))
            return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.TOKEN_EMPTY).sendResponse(res)

          if (token != config.token)
            return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.TOKEN_INVALID).sendResponse(res)
        }

        return next()
      } else {
        if (method == "GET") {
          return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.ONLY_POST).sendResponse(res)
        } else {
          return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.ONLY_GET).sendResponse(res)
        }
      }
  }

  next()
})

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

app.get("/test", function(req, res) {

})

app.get("/list", function(req, res) {
  if (!req.session.isLogged)
    return res.redirect("/login")

  res.render("list", {title: "Homework List", token: config.token})
})

app.get("/manage", function(req, res) {
  if (!req.session.isLogged)
    return res.redirect("/login")

  res.render("manage", {title: "Subject Management", token: config.token})
})

app.post("/api/login", function(req, res) {
  var response = new APIResponse()
  if (req.session.isLogged) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.LOGGED_ALREADY).sendResponse(res)
  }

  var password = req.param("password")

  if (utils.isEmpty(password)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.PASSWORD_EMPTY).sendResponse(res)
  }

  password = SHA256(password + config.password.salt)

  if (password == config.password.value) {
    req.session.isLogged = true
    return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.LOGGED_SUCCESS).sendResponse(res)
  } else {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.PASSWORD_INVALID).sendResponse(res)
  }
})

app.get("/api/logout", function(req, res) {
  req.session.destroy()
  new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.LOGOUT_SUCCESS).sendResponse(res)
})

app.post("/api/subject/add", function(req, res) {
  var response = new APIResponse()
  var label = req.param("label")
  var name = req.param("name")

  if (utils.isEmpty(label) || utils.isEmpty(name)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  var collection = db.get("subjects")
  collection.find({$or: [{label: label}, {name: name}]}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
    }

    if (doc.length > 0) {
      return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.SUBJECT_EXISTS).sendResponse(res)
    } else {
      collection.insert({label: label, name: name}, function(err, doc) {
        if (err) {
          return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.SUBJECT_EXISTS).sendResponse(res)
        }

        return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.SUBJECT_ADDED).sendResponse(res)
      })
    }
  })
})

/*
  Format types:
  HTML
  dropdown
*/
app.get("/api/subject/get", function(req, res) {
  var format = req.param("format")

  if (utils.isEmpty(format)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  format = format.toLowerCase()

  var collection = db.get("subjects")
  if(format == "html" || format == "dropdown") {
    collection.find({}, function(err, doc) {
      if (err) {
        return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
      }
        if (doc.length > 0) {
          res.render("subjects-list", {data: doc, format: format}, function(err, html) {
            return new APIResponse().setResponse(APIStatus.SUCCESS, html).sendResponse(res)
          })
        } else {
          return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.SUBJECT_EMPTY).sendResponse(res)
        }
    })
  } else {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.FORMAT_INVALID).sendResponse(res)
  }
})

app.post("/api/subject/remove", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")

  if (utils.isEmpty(id)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.GENERAL_ERROR).sendResponse(res)
  }

  var collection = db.get("subjects")
  id = collection.id(id)

  collection.findAndModify({_id: id}, {}, {remove: true}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
    }

    return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.SUBJECT_REMOVED).sendResponse(res)
  })
})

app.post("/api/subject/edit", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")
  var label = req.param("label")
  var name = req.param("name")

  if (utils.isEmpty(id) || utils.isEmpty(label) || utils.isEmpty(name)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  var collection = db.get("subjects")
  id = collection.id(id)

  collection.update({_id: id}, {label: label, name: name}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.ERORR, err.message).sendResponse(res)
    }

    return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.SUBJECT_EDITED).sendResponse(res)
  })
})

app.post("/api/homework/add", function(req, res) {
  var response = new APIResponse()
  var date = req.param("date")
  var subject = req.param("subject")
  var description = req.param("description")

  if (utils.isEmpty(date) || utils.isEmpty(subject) || utils.isEmpty(description)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  var collection = db.get("homework")
  collection.insert({date: date, subject: subject, description: description, done: false}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.SUCCESS, err.message).sendResponse(res)
    }

    return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.HOMEWORK_ADDED).sendResponse(res)
  })
})

/*
  Format types:
  HTML
  count
*/
app.get("/api/homework/get", function(req, res) {
  var format = req.param("format")

  if (utils.isEmpty(format)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  format = format.toLowerCase()

  var collection = db.get("homework")
  if (format == "count") {
    collection.find({done: false}, function(err, doc) {
      if (err) {
        return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
      }

      return new APIResponse().setResponse(APIStatus.SUCCESS, doc.length).sendResponse(res)
    })
  } else if(format == "html") {
    collection.find({}, {sort: {done: 1, date: 1}}, function(err, doc) {
      if (err) {
        res.render("homework-list", {data: "error"}, function(err, html) {
          html = utils.cleanString(html)
          return new APIResponse().setResponse(APIStatus.ERROR, html).sendResponse(res)
        })
      }
        if (doc.length > 0) {
          res.render("homework-list", {data: doc}, function(err, html) {
            html = utils.cleanString(html)
            return new APIResponse().setResponse(APIStatus.SUCCESS, html).sendResponse(res)
          })
        } else {
          return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.HOMEWORK_EMPTY).sendResponse(res)
        }
    })
  } else {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.FORMAT_INVALID).sendResponse(res)
  }
})

app.post("/api/homework/toggle", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")

  if (utils.isEmpty(id)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.GENERAL_ERROR).sendResponse(res)
  }

  var collection = db.get("homework")
  id = collection.id(id)
  collection.findOne({_id: id}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
    }

    var status = !doc.done
    collection.findAndModify({_id: id}, {$set: {done: status}}, function(err, doc) {
      if (err) {
        return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
      }

      return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.HOMEWORK_TOGGLED).sendResponse(res)
    })
  })
})

app.post("/api/homework/edit", function(req, res) {
  var response = new APIResponse()
  var id = req.param("id")
  var date = req.param("date")
  var subject = req.param("subject")
  var description = req.param("description")

  if (utils.isEmpty(id) || utils.isEmpty(date) || utils.isEmpty(subject) || utils.isEmpty(description)) {
    return new APIResponse().setResponse(APIStatus.ERROR, APIResponses.REQUEST_EMPTY).sendResponse(res)
  }

  var collection = db.get("homework")
  id = collection.id(id)

  collection.update({_id: id}, {$set: {date: date, subject: subject, description: description}}, function(err, doc) {
    if (err) {
      return new APIResponse().setResponse(APIStatus.ERROR, err.message).sendResponse(res)
    }

    return new APIResponse().setResponse(APIStatus.SUCCESS, APIResponses.HOMEWORK_EDITED).sendResponse(res)
  })
})

app.use(function(req, res, next) {
  res.status(404).send("Error 404: File not found.")
})

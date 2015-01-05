module.exports = function() {
  var responseStatus = null
  var responseMessage = null

  this.status = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    INTERNAL_ERROR: 500
  }

  this.responses = {
    ONLY_GET: "This feature only accepts GET requests.",
    ONLY_POST: "This feature only accepts POST requests.",
    REQUEST_EMPTY: "Something is empty.",
    TOKEN_INVALID: "The provided token is invalid.",
    TOKEN_EMPTY: "Token not provided.",
    LOGOUT_SUCCESS: "Successfully logged out.",
    LOGGED_ALREADY: "User already logged in.",
    LOGGED_SUCCESS: "User logged in with success.",
    PASSWORD_EMPTY: "The provided password is empty.",
    PASSWORD_INVALID: "The provided password is invalid.",
    SUBJECT_EXISTS: "The subject already exists.",
    SUBJECT_ADDED: "Subject added with success.",
    SUBJECT_REMOVED: "Subject removed with success.",
    SUBJECT_EDITED: "Subject edited with success.",
    HOMEWORK_ADDED: "Homework added with success.",
    HOMEWORK_TOGGLED: "Homework status toggled with success.",
    HOMEWORK_EDITED: "Homework edited with success.",
    HOMEWORK_EMPTY: "There is no homework on the database",
    SUBJECT_EMPTY: "There are no subjects on the database",
    FORMAT_INVALID: "Invalid format.",
    GENERAL_ERROR: "An error has occurred."
  }

  this.setStatus = function(status) {
    this.responseStatus = status

    return this
  }

  this.setMessage = function(message) {
    this.responseMessage = message

    return this
  }

  this.setResponse = function(status, message) {
    this.responseStatus = status
    this.responseMessage = message

    return this
  }

  this.getStatus = function() {
    return this.responseStatus
  }

  this.getMessage = function() {
    return this.responseMessage()
  }

  this.getResponse = function() {
    return {status: this.responseStatus, message: this.responseMessage}
  }

  this.sendResponse = function(res) {
    res.json(this.getResponse())
  }
}

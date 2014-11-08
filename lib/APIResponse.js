module.exports = function() {
  var responseStatus = null;
  var responseMessage = null;

  this.status = {
    SUCCESS: "success",
    ERROR: "error",
    CRITICAL: "critical"
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

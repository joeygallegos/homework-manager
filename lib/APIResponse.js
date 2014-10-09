module.exports = function() {
  var responseStatus = null;
  var responseMessage = null;

  this.setStatus = function(status) {
    responseStatus = status
  }

  this.setMessage = function(message) {
    responseMessage = message
  }

  this.setResponse = function(status, message) {
    responseStatus = status
    responseMessage = message
  }

  this.getStatus = function() {
    return responseStatus
  }

  this.getMessage = function() {
    return responseMessage()
  }

  this.getResponse = function() {
    return {status: responseStatus, message: responseMessage}
  }

  this.sendResponse = function(res) {
    res.json(this.getResponse())
  }
}

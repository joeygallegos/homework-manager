module.exports = function() {
  var parts = []

  this.methods = {
    POST: "POST",
    GET: "GET"
  }

  this.registerPart = function(path, method) {
    parts.push({path: path, method: method})
  }

  this.getParts = function() {
    return parts
  }
}

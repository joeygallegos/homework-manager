module.exports = function() {
  var pages = []

  this.methods = {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE"
  }

  this.registerPage = function(path, method, auth) {
    path = "/api/" + path
    pages.push({path: path, method: method, auth: auth})
  }

  this.getPages = function() {
    return pages
  }

  this.getPage = function(path) {
    var page = null

    for (var i = 0; i < pages.length; i++) {
      page = pages[i]
      if (page.path == path) {
        return page
      }
    }

    return null
  }
}

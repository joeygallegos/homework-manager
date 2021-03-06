// Functions
function postForm(element, toRun) {
  $(element).submit(function(event) {
    event.preventDefault();

    var url = $(this).attr("action")
    var formData = $(this).serializeArray()

    if (pageTitle.indexOf("Login") < 0)
      formData.push("{token: token}")
      //TODO

    $.post(url, formData, function(data) { toRun(data) }, "json");
  })
}

function createAlert(element, clear, type, message) {
  var typeClass;
  var prefix;

  switch(type) {
    case "success": typeClass = "success"; prefix = "Success!"; break
    case "error": typeClass = "danger"; prefix = "Error!"; break
    case "critical": typeClass = "danger"; prefix = "Critical Error!"; break
  }

  if (clear)
    $(element).empty()

  $(element).append(
    '<div class="alert alert-' + typeClass + ' alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
      '<strong>' + prefix + '</strong> ' + message +
    '</div>'
  )

  console.log(message)
}

function getCurrentDate() {
  return new Date().toJSON().slice(0, 10)
}

// Subjects
postForm("#addSubject", function(response) {
  createAlert("#alerts", true, response.status, response.message)

  if (response.status == "success") {
    refreshSubjectList()

    $("#addSubject").find("input[name='label']").val("")
    $("#addSubject").find("input[name='name']").val("")
  }
})

postForm("#editSubject form", function(response) {
  createAlert("#alerts", true, response.status, response.message)
  $("#editSubject").modal("hide")

  if (response.status == "success")
    refreshSubjectList()
})

function removeSubject(id) {
  var response = confirm("Do you REALLY want to remove a subject?")
  if (response) {
    console.log("Removing subject")
    $.post("/api/subject/remove", {token: token, id: id}, function(response) {
      createAlert("#alerts", true, response.status, response.message)

      if (response.status == "success")
        refreshSubjectList()
    }, "json")
  }
}

function refreshSubjectList() {
  var pageTitle = $("title").html()
  if (pageTitle.indexOf("Subject Management") > -1) {
    console.log("Refreshing subject list")
    $.ajax("/api/subject/get?token=" + token + "&format=html").done(function(response) {
      var html = response.message
      $("#subjects").html(html)
    })
  }

  populateSubjects()
}

function showEditSubject(id, label, name) {
  var form = $("#editSubject form")

  $(form).find("input[name='id']").val(id)
  $(form).find("input[name='label']").val(label)
  $(form).find("input[name='name']").val(name)

  $("#editSubject").modal("show")
}

function populateSubjects() {
  console.log("Populating subjects")
  var pageTitle = $("title").html()
  $.ajax("/api/subject/get?token=" + token + "&format=dropdown").done(function(response) {
    //TODO Handle errors
    var html = response.message
    $("#addHomework select").html(html)

    if (pageTitle.indexOf("Homework List") > -1) {
      $("#editHomework select").html(html)
    }
  })
}

// Homework
postForm("#addHomework form", function(response) {
  createAlert("#alerts", true, response.status, response.message)
  $("#addHomework").modal("hide")

  if (response.status == "success") {
    refreshHomeworkList()

    $("#addHomework").find("input[name='date']").val("")
    $("#addHomework").find("input[name='subject']").val(getCurrentDate())
    $("#addHomework").find("textarea[name='description']").val("")

    var subjects = $("#addHomework").find("select[name='subject'] option")
    $(subjects).each(function() {
      $(this).prop("selected", false)
    });
  }
})

postForm("#editHomework form", function(response) {
  createAlert("#alerts", true, response.status, response.message)
  $("#editHomework").modal("hide")

  if (response.status == "success")
    refreshHomeworkList()
})

function refreshHomeworkList() {
  var pageTitle = $("title").html()
  if (pageTitle.indexOf("Homework List") > -1) {
    console.log("Refreshing homework list")
    $.ajax("/api/homework/get?token=" + token + "&format=html").done(function(response) {
      //TODO Handle errors
      var html = response.message
      $("#homework").html(html)
    })
  }

  refreshHomeworkCount()
}

function showEditHomework(id, date, subject, description) {
  var form = $("#editHomework form")

  $(form).find("input[name='id']").val(id)
  $(form).find("input[name='date']").val(date)
  $(form).find("textarea[name='description']").html(description)

  var subjects = $(form).find("select[name='subject'] option")
  $(subjects).each(function() {
    if (this.value == subject) {
      $(this).prop("selected", true)
    } else if ($(this).prop("selected") == true) {
      $(this).prop("selected", false)
    }
  });

  $("#editHomework").modal("show")
}

function toggleHomework(id) {
  console.log("Toggling homework")
  $.post("/api/homework/toggle", {token: token, id: id}, function(response) {
    createAlert("#alerts", true, response.status, response.message)

    if (response.status == "success")
      refreshHomeworkList()
  }, "json")
}

// Sidebar
function refreshHomeworkCount() {
  console.log("Refreshing homework count")
  $.ajax("/api/homework/get?token=" + token + "&format=count").done(function(response) {
    //TODO Handle errors
    var html = response.message;
    if (html == "0") {
      $("#homework-count").html("")
    } else {
      $("#homework-count").html(html)
    }
  })
}

// Login
postForm("#login", function(response) {
  //TODO Handle errors and make this more useful (?)
  if (response.status == "success") {
    window.location = "/list"
  } else {
    createAlert("#alerts", true, response.status, response.message)
  }
})

function logOut() {
  console.log("Logging out")
  $.ajax("/api/logout?token=" + token).done(function(response) {
    //TODO Handle errors
    console.log(response.message)
    window.location = "/login"
  })
}

// Populate everything
$(window).ready(function() {
  refreshHomeworkList()
  refreshSubjectList()
  populateSubjects()
})

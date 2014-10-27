// Functions
function postForm(element, toRun) {
  $(element).submit(function(event) {
    event.preventDefault();

    var url = $(this).attr("action")
    var formData = $(this).serializeArray()

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

function populateDisciplines() {
  console.log("Populating disciplines")
  var pageTitle = $("title").html()
  $.ajax("/api/discipline/get?lite=true").done(function(html) {
    $("#addHomework select").html(html)

    if (pageTitle.indexOf("Homework List") > -1) {
      $("#editHomework select").html(html)
    }
  })
}

// Disciplines
postForm("#addDiscipline", function(data) {
  createAlert("#alerts", true, data.status, data.message)

  if (data.status == "success")
    refreshDisciplineList()
})

postForm("#editDiscipline form", function(data) {
  createAlert("#alerts", true, data.status, data.message)
  $("#editDiscipline").modal("hide")

  if (data.status == "success")
    refreshDisciplineList()
})

function removeDiscipline(id) {
  var response = confirm("Do you REALLY want to remove a discipline?")
  if (response) {
    console.log("Removing discipline")
    $.post("/api/discipline/remove", {id: id}, function(data) {
      createAlert("#alerts", true, data.status, data.message)

      if (data.status == "success")
        refreshDisciplineList()
    }, "json")
  }
}

function refreshDisciplineList() {
  var pageTitle = $("title").html()
  if (pageTitle.indexOf("Discipline Management") > -1) {
    console.log("Refreshing discipline list")
    $.ajax("/api/discipline/get").done(function(html) {
      $("#disciplines").html(html)
    })
  }
}

function showEditDiscipline(id, label, name) {
  var form = $("#editDiscipline form");

  $(form).find("input[name='id']").val(id)
  $(form).find("input[name='label']").val(label)
  $(form).find("input[name='name']").val(name)

  $("#editDiscipline").modal("show")
}

// Homework
postForm("#addHomework form", function(data) {
  createAlert("#alerts", true, data.status, data.message)
  $("#addHomework").modal("hide")

  if (data.status == "success")
    refreshHomeworkList()
})

postForm("#editHomework form", function(data) {
  createAlert("#alerts", true, data.status, data.message)
  $("#editHomework").modal("hide")

  if (data.status == "success")
    refreshHomeworkList()
})

function refreshHomeworkList() {
  var pageTitle = $("title").html()
  if (pageTitle.indexOf("Homework List") > -1) {
    console.log("Refreshing homework list")
    $.ajax("/api/homework/get").done(function(html) {
      $("#homework").html(html)
    })
  }

  refreshHomeworkCount()
}

function showEditHomework(id, date, discipline, description) {
  var form = $("#editHomework form")

  $(form).find("input[name='id']").val(id)
  $(form).find("input[name='date']").val(date)
  $(form).find("textarea[name='description']").html(description)

  var disciplines = $(form).find("select[name='discipline'] option")
  $(disciplines).each(function() {
    if (this.value == discipline) {
      $(this).prop("selected", true)
    } else if ($(this).prop("selected") == true) {
      $(this).prop("selected", false)
    }
  });

  $("#editHomework").modal("show")
}

function toggleHomework(id) {
  console.log("Toggling homework")
  $.post("/api/homework/toggle", {id: id}, function(data) {
    createAlert("#alerts", true, data.status, data.message)

    if (data.status == "success")
      refreshHomeworkList()
  }, "json")
}

// Sidebar
function refreshHomeworkCount() {
  console.log("Refreshing homework count")
  $.ajax("/api/homework/get?count=true").done(function(html) {
    if (html == "0") {
      $("#homework-count").html("")
    } else {
      $("#homework-count").html(html)
    }
  })
}

// Populate everything
$(window).ready(function() {
  refreshHomeworkList()
  refreshDisciplineList()
  populateDisciplines()
})

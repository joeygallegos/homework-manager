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

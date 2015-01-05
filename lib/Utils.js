exports.isEmpty = function(value) {
  return value === undefined || value === null || value == "";
}

exports.trim = function(str) {
  return str.replace(/^\s+|\s+$/gm, "");
}

exports.cleanString = function(str) {
  str = str.replace(/[\s\n\r]+/g, " ");
  return exports.trim(str);
}

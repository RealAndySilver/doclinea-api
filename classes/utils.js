exports.remove_empty = function trim_nulls(data) {
  var y;
  for (var x in data) {
    y = data[x];
    if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length == 0)) {
      delete data[x];
    }
    if (y instanceof Object) y = trim_nulls(y);
  }
  return data;
};
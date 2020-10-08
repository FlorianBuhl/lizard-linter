function bad_function() {
  var i = 0
  var toReturn
  for (i = 0; i < 10; i++) {
    if (i === 3) {
      toReturn = 10
    }
  }
  return toReturn
}

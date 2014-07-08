extendedSubscribe = function (colectionName, handlerName) {
  //    debugger;
  var handler = {};
  handler = Meteor.subscribe(colectionName, function () {
    _.forEach(handler.observers, function (cb) {
      cb(colectionName);
    });
  });
  handler.observers = [];

  handler.wait = function (cb) {
    if (this.ready())
      cb(colectionName);
    else
      this.observers.push(cb);
  }
  window[handlerName] = handler;
};
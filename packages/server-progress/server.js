progress = {
  start: function (user, name, displayName) {
    return new prog(user, name, displayName);
  }
};
var prog = function (user, name, displayName) {
  var self = this;
  self.name = name;
  self.user = user;
  self.progress = 0;
  self.displayName = displayName;
  sender.add(user, name, {progress: self.progress, displayName : self.displayName});
};

prog.prototype.set = function (progress) {
  var self = this;
  self.progress = progress;
  sender.update(self.user, self.name, {progress: self.progress})
};

prog.prototype.end = function () {
  var self = this;
  sender.delete(self.user, self.name);
};

Meteor.publish('progressData', function () {
  var self = this;
  sender._setup(self);
  self.ready();
});

var sender = {
  add: function (user, key, value) {
    if (user){
      var sub = this._subs[user];
      if (sub){
         sub.added('progressData', key, value);
      }else{
        //wait for subscription
      }
    }else{
      //todo
    }
  },
  update: function (user, key, fields) {
    if (user){
      var sub = this._subs[user];
      if (sub){
        sub.changed('progressData', key, fields);
      }else{
        //wait for subscription
      }
    }else{
      //todo
    }
  },
  _globalSubs:[],
  _subs: {},
  _setup: function (sub) {
    if (sub.userId) {
      this._subs[sub.userId] = sub;
    } else {
      //self._globalSubs.push(sub)
    }
  },
  delete: function (user, key) {
    if (user){
      var sub = this._subs[user];
      if (sub){
        sub.removed('progressData', key);
      }else{
        //wait for subscription
      }
    }else{
      //todo
    }
  }
};
ServerProgress = progress;

Meteor.methods({
  testProgress: function () {
    var progress = ServerProgress.start(Meteor.userId(),'test');
    var i = 0;
    var interval = setInterval(function(){
      progress.set(++i);
      if (i>=100){
        clearInterval(interval);
      }
    }, 1000);
  }
});
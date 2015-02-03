
var progressData = new Meteor.Collection('progressData');

Meteor.subscribe('progressData');

progress = {
  get: function (name) {
      var pd = progressData.findOne(name);
    if (pd){
      return pd.progress;
    }
  }
};

ServerProgress = progress;

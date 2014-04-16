Meteor.startup(function(){
  ko.dep = function(get){
    var obs= ko.observable(get());
    obs._dep=function(){
      obs(get());
    }
    obs._conputation=Meteor.autorun(obs._dep);
    return obs;
  }
});
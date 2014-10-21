DashboardController = RouteController.extend({
  layoutTemplate: 'mainLayout',
    waitOn: function () {
      ActivitiesHandler = Meteor.subscribe('activities');
      return [ActivitiesHandler];
    },
    action: function () {
        if (this.ready())
            this.render('dashboard');
        else
            this.render('loading');
    },
    onAfterAction: function() {
      var title = 'Dashboard',
        description = 'Quickly check system status and activity';
      SEO.set({
        title: title,
        meta: {
          'description': description
        },
        og: {
          'title': title,
          'description': description
        }
      });
    }
});

var query ={
  options: {
    limit: 50,
    sort: {'data.dateCreated':-1}
  },
  filter: {
    searchString: ''
  }
};
var queryDep= new Deps.Dependency;
var customerQuery = {
  Customer: {
    $exists: true
  }
};
var employeeQuery = {
  Employee: {
    $exists: true
  }
};
Template.dashboard.created = function(){
  Meteor.autorun(function() {
    queryDep.depend();

    var f={};
    if (query.filter.searchString){
      var regexObject={
        $regex: query.filter.searchString,
        $options : 'i'
      };

      //contactable
      var contQuery = { $or: [] };
      var aux = {};
      _.each(['person.firstName', 'person.lastName', 'person.jobTitle', 'organization.organizationName', 'organization.department'],function(name){
        aux = {};
        aux[name]=regexObject;
        contQuery.$or.push(aux);
      })
      var contactables = _.map(Contactables.find(contQuery).fetch(), function(doc){ return doc._id});


      //jobs
      var jobQuery={ $or: [] };
      _.each(['publicJobTitle'],function(name){
        aux = {};
        aux[name]=regexObject;
        jobQuery.$or.push(aux);
      })
      var jobs = _.map(Jobs.find(jobQuery).fetch(), function(doc){ return doc._id});

      //task
      var taskQuery={ $or: [] };
      _.each(['msg'],function(name){
        aux = {};
        aux[name]=regexObject;
        taskQuery.$or.push(aux);
      })
      var task = _.map(Tasks.find(taskQuery).fetch(), function(doc){ return doc._id});

      var ids = contactables.concat(jobs).concat(task);
      f.entityId= { $in: ids };
    }

    //ActivitiesHandler.setFilter(f);
  });
};
//Template.dashboard.waitOn=['ObjTypesHandler', 'UsersHandler']
Template.dashboard.helpers({
  activities: function(){
    return Activities.find();
  },
  log: function(data){
    console.log('dat',this,data);
  },
  customerHistory: function(){

    return getHistorical(Contactables, getDays(), customerQuery);
  },
  employeeHistory: function(){

    return getHistorical(Contactables, getDays(), employeeQuery);
  },
  jobHistory: function(){
    return getHistorical(Jobs, getDays());
  },
  jobCount: function(){
    return Jobs.find().count();
  },
  customerCount: function(){
    return Contactables.find(customerQuery).count();
  },
  employeeCount: function(){
    return Contactables.find(employeeQuery).count();
  },
  getUserName: function(id) {
    var u = Meteor.users.findOne(id || this.toString());
    return u && u.username;
  }
});

var getDays = function(){
  var now = new Date();
  var timeInADay = 24 * 60 * 60 * 1000;
  return [now.getTime() - (timeInADay) * 7, now.getTime() - (timeInADay) * 6, now.getTime() - (timeInADay) * 5, now.getTime() - (timeInADay) * 4, now.getTime() - (timeInADay) * 3, now.getTime() - (timeInADay) * 2, now.getTime() - (timeInADay) * 1, now.getTime() - (timeInADay) * 0];
};

Template.dashboard.events({
  'keyup #searchString': _.debounce(function(e){
      query.filter.searchString = e.target.value;
      queryDep.changed();
    },200),
  'click .addPlacement': function(){
    Session.set('addOptions', {job: this.entityId});
    Router.go('/placementAdd/placement');
  }
});

Template.activity.helpers({
  getTemplateForActivity: function(){
    switch (this.type){
      case Enums.activitiesType.contactableAdd:
        return 'newContactableActivity';
      case Enums.activitiesType.jobAdd:
        return 'newJobActivity';
      case Enums.activitiesType.taskAdd:
        return 'newTaskActivity';
    }
  }
});
Template.newTaskActivity.getUserName = function(){
  return this.userName;
};


Template.newContactableActivity.getActivityColor = function(){
  return helper.getActivityColor(this);
};
Template.newContactableActivity.log=function() {
  console.log('nca',this);
}
Template.newContactableActivity.getActivityIcon = function(){
  return helper.getActivityIcon(this);
};
Template.newContactableActivity.getUserName = function(){
  return this.userName;
};

Template.sparkline.text= function(){
  return this.join();
}
Template.sparkline.rendered = function() {
  this.$('span').sparkline("html", {
    type: "bar",
    fillColor: "#4cd964",
    lineColor: "#4cd964",
    width: "50",
    height: "24"
  });
}


//  self.assign=function(jobId){
//    var options={};
//    var job=Jobs.findOne({
//      _id: jobId
//    });
//    if(job.placement){
//      options.placementId=job.placement;
//    }else{
//      options.jobId=jobId;
//    }
//    Composer.showModal( 'placementAdd', options);
//  }
//  return self;
var getHistorical = function (collection, timeStamps, query) {
  var history = [];
  var q = query || {};
  _.each(timeStamps, function (time) {
    q.dateCreated = {
      $lte: time
    }
    history.push(collection.find(q).count());
  })
  var last = history.length - 1;
  if (history[last] != 0) {
    var growth = Math.round(100 * (history[last] - history[last - 1]) / history[last]);
  } else {
    var growth = 0;
  }

  history.growth = (growth > 0 ? '+' : growth < 0 ? '-' : '') + growth + '%';
  return history;
}

var deepLog = function(obj, path) {
  if (path == undefined)
    path = "";
  _.forEach(_.keys(obj), function(key) {
    if(_.isObject(key))
      deepLog(key,  path + ' > ' + key);
    else {
      console.log('-----------------------------------------------------');
      path += ' > ' + key;
      console.log(path + ': ' + obj[key]);
    }
  })
};

//infinite scroll
Template.dashboard.showMore= function() {
  return function () {
    query.options.limit += 50;
    queryDep.changed();
  };
}

var colors = [
  {
    name: 'red',
    value: '#ff2d55'
  },
  {
    name: 'yellow',
    value: '#fc0'
  },
  {
    name: 'pink',
    value: '#cb53fc'
  },
  {
    name: 'blue',
    value: '#1c91f5'
  }
]

var icons = [
  {
    name: 'build',
    value: 'icon-buildings-1'
  },
  {
    name: 'briefcase',
    value: 'icon-briefcase'
  },
  {
    name: 'connection',
    value: 'icon-connection-1'
  },
  {
    name: 'contact',
    value: 'icon-address-1'
  }
]
var defaultIcon = 'icon-question-mark';

helper = {
    emailRE:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};
helper.emailRE.str="^(([^<>()[\\]\\.,;:\\s@\"]+(\\.[^<>()[\\]\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))";

_.extend(helper, {

  getObjType: function (id) {
    return dType.ObjTypes.findOne({
      _id: id
    });
  },

  getIconForObjName: function (name) {
    var objtype = dType.ObjTypes.findOne({
      name: name
    });
    if (objtype && objtype.style && objtype.style.icon)
      return _.findWhere(icons, {
        name: objtype.style.icon
      }).value;

    return defaultIcon;
  },
  getEntityIcon: function (entity) {
    var type = dType.ObjTypes.findOne({
      name: { $in: entity.objNameArray },
        style: { $exists: true }
    });
    return _.findWhere(icons, {
      name: type.style.icon
    }).value;
  },
  getActivityColor: function (activity) {
    var style = dType.ObjTypes.findOne({
      name: _.isString(activity.data.objTypeName) ? activity.data.objTypeName : activity.data.objTypeName()
    }).style;
    return _.findWhere(colors, {
      name: style.color
    }).value;
  },
  getActivityIcon: function (activity) {

    var style = dType.ObjTypes.findOne({
      name: _.isString(activity.data.objTypeName)? activity.data.objTypeName : activity.data.objTypeName()
    }).style;
    return _.findWhere(icons, {
      name: style.icon
    }).value;
  }
});

/*
 * Tasks
 */
var taskStatesStyle = {};

taskStatesStyle['Pending'] = {
  icon: 'fa fa-exclamation-circle',
  textCSS: 'text-danger'
};
taskStatesStyle['Future'] = {
  icon: 'fa fa-forward',
  textCSS: 'text-info'
};
taskStatesStyle['Completed'] = {
  icon: 'fa fa-check-circle',
  textCSS: 'text-success'
};
taskStatesStyle['Closed'] = {
  icon: 'fa fa-archive',
  textCSS: 'text-muted'
};

_.extend(helper, {
  getTaskStateIcon: function (state) {
    var data = taskStatesStyle[state];
    return data ? data.icon : '';
  }
})

LookupsManagementController = RouteController.extend({
  template: 'lookUpsManagement',
  waitOn: function () {
    return HierarchiesHandler;
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('lookUpsManagement');
  }
});

var query = new Utils.ObjectDefinition({
  reactiveProps: {
   searchString: {},
   codeType: {}
  }
});
var defaultUpdateDep = new Deps.Dependency;

Template.selectLookUpType.lookUpTypes = function() {
  var lookUpTypes = [];
  _.forEach(Enums.lookUpTypes, function(subType){
    _.forEach(subType, function(item){
      lookUpTypes.push(item)
    })
  });

  query.codeType.value = lookUpTypes[0].code;

  return lookUpTypes;
};

Template.selectLookUpType.isSelected = function(id){
  return (this.value || this._id) ==id;
};

Template.selectLookUpType.events = {
  'change': function(e) {
    query.codeType.value = parseInt(e.currentTarget.value);
  }
};

Template.searchLookUpItem.searchString = function() {
  return query.searchString;
};

Template.lookUpsManagement.items = function() {
  defaultUpdateDep.depend();

  var q = { codeType: query.codeType.value};
  if (query.searchString.value)
    q.$or = [
      {
        displayName: {
          $regex:  query.searchString.value ,
          $options: 'i'
        }
      }
    ];

  var hier = Hierarchies.findOne();
  return LookUps.find(q,
    {
      transform: function(item) {
        item.editMode = false;
        item.errMsg = '';

        item.isDefault = !!_.findWhere(hier.defaultLookUpValues, { codeType: item.codeType, valueId: item._id});

        return item;
      }
    }
  );
};

Template.lookUpsManagement.events = {
  'click #add-item': function() {
    var newValue = $('#new-item').value;
    var lookUpTypeCode = query.codeType.value;
    if (!newValue)
      return;

    debugger;
    Meteor.call('addLookUpItem', { displayName: newValue, codeType: lookUpTypeCode },
      function(err, result) {
        if (!err)
          self.newLookUpItem('');
        else
          console.log(err);
      }
    );
  },
  'click .set-default': function(e) {
    var item = this;
    Meteor.call('setLookUpDefault', item.codeType, item._id);
    defaultUpdateDep.changed();
  }
};


//Template.lookUpsManagement.waitOn = ['LookUpsHandler'];
//
//Template.lookUpsManagement.viewModel = function () {
//  var self = this;
//
//  self.lookUpTypes = [];
//  _.forEach(Enums.lookUpTypes, function(subType){
//    _.forEach(subType, function(item){
//      self.lookUpTypes.push(item)
//    })
//  })
//
//  self.selectedLookUp = ko.observable(self.lookUpTypes[0]);
//  self.searchString = ko.observable();
//
//  var query = ko.computed(function(){
//    var q = { codeType: self.selectedLookUp().code };
//    if (self.searchString())
//      q.$or = [
//        {
//          displayName: {
//            $regex:  self.searchString(),
//            $options: 'i'
//          }
//        }
//      ]
//
//    return q;
//  });
//
//  var getLookUpValues = function (self) {
//    debugger;
//    var hier = Hierarchies.findOne();
//    self.items = ko.meteor.find(LookUps, query,
//      {
//        transform: function(item) {
//          item.editMode = false;
//          item.errMsg = '';
//
//          item.isDefault = !!_.findWhere(hier.defaultLookUpValues, { codeType: item.codeType, valueId: item._id});
//
//          return item;
//        }
//      }
//    );
//  };
//
//  getLookUpValues(self);
//
//  Meteor.autorun(getLookUpValues);
//
//  _.forEach(self.lookUps, function(lookUp){
//    lookUp.items = _.map(lookUp.items, function(item){
//      //debugger;
//      var newItem = ko.mapping.fromJS(item);
//      _.extend(newItem, { editMode: ko.observable(false) });
//      newItem.displayName.extend({required: true});
//      return newItem;
//    })
//  });
//
//  self.newLookUpItem = ko.observable();
//
//  self.addNewLookupItem = function() {
//    Meteor.call('addLookUpItem', { displayName: self.newLookUpItem(), codeType: self.selectedLookUp().code },
//      function(err, result) {
//        if (!err)
//          self.newLookUpItem('');
//        else
//          console.log(err);
//      }
//    );
//  };
//
//  self.startEditing = function(item) {
//    item.editMode(true);
//    item.oldValue = ko.toJS(item);
//  };
//
//  self.edit = function(item) {
//    LookUps.update({_id: item._id()}, {
//      $set: {
//        displayName: item.displayName()
//      }
//    }, function(err, result){
//      if(!err)
//        item.editMode(false);
//      else
//        item.errMsg('Error: ' + err + ', try agin..');
//    });
//  };
//
//  self.cancelEdit = function(item) {
//    // Set old editable values
//    item.displayName(item.oldValue.displayName);
//    item.editMode(false);
//  };
//
//  self.setAsDefault = function(item) {
//    Meteor.call('setLookUpDefault', item.codeType(), item._id());
//  };
//
//  return self;
//};
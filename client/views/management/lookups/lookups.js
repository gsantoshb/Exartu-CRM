LookupsManagementController = RouteController.extend({
  template: 'lookUpsManagement',
  onAfterAction: function() {
    var title = 'Settings',
      description = 'Lookup configurations, etc';
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

Template.lookUpsManagement.waitOn = ['LookUpsHandler'];

Template.lookUpsManagement.viewModel = function () {
  var self = this;

  self.lookUpTypes = [];
  _.forEach(Enums.lookUpTypes, function(subType){
    _.forEach(subType, function(item){
      self.lookUpTypes.push(item)
    })
  })

  self.selectedLookUp = ko.observable(self.lookUpTypes[0]);
  self.searchString = ko.observable();

  var query = ko.computed(function(){
    var q = { codeType: self.selectedLookUp().code };
    if (self.searchString())
      q.$or = [
        {
          displayName: {
            $regex:  self.searchString(),
            $options: 'i'
          }
        }
      ]

    return q;
  });

  self.items = ko.meteor.find(LookUps, query,
    {
      transform: function(item)
        {
          item.editMode = false;
          item.errMsg = '';
          return item;
        }
    }
  );

  _.forEach(self.lookUps, function(lookUp){
    lookUp.items = _.map(lookUp.items, function(item){
      //debugger;
      var newItem = ko.mapping.fromJS(item);
      _.extend(newItem, { editMode: ko.observable(false) });
      newItem.displayName.extend({required: true});
      return newItem;
    })
  });

  self.newLookUpItem = ko.observable();

  self.addNewLookupItem = function() {
    Meteor.call('addLookUpItem', { displayName: self.newLookUpItem(), codeType: self.selectedLookUp().code },
      function(err, result) {
        if (!err)
          self.newLookUpItem('');
        else
          console.log(err);
      }
    );
  };

  self.startEditing = function(item) {
    item.editMode(true);
    item.oldValue = ko.toJS(item);
  };

  self.edit = function(item) {
    LookUps.update({_id: item._id()}, {
      $set: {
        displayName: item.displayName()
      }
    }, function(err, result){
      if(!err)
        item.editMode(false);
      else
        item.errMsg('Error: ' + err + ', try agin..');
    });
  };

  self.cancelEdit = function(item) {
    // Set old editable values
    item.displayName(item.oldValue.displayName);
    item.editMode(false);
  };

  return self;
};
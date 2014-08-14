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
  },
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

var injectTestData= function()
    {
        if (  Contactables.find().count()>10)
        {
            var msg1="It looks like you've already been creating data quite a bit of data in this tenancy, so I'm a bit afraid to ";
            var msg1=msg1+ "do it here.  Have development do it for you with Meteor.call(\'loadDemoData\')";
            alert(msg1);
            return;
        }
        if (confirm('Inject test data into this tenancy node?'))
        Meteor.call('loadDemoData');
    };
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
        Utils.reactiveProp(item,'editMode',false)
        item.errMsg = '';
        return item;
      },
      sort: {displayName: 1}
    }
  );
};

Template.lookUpsManagement.events = {
    'click .btn-injectTestData': function(){
        injectTestData();
    },
  'change .set-default': function(e) {
    var item = this;
    if (e.target.checked){
      Meteor.call('setLookUpDefault', item.codeType, item._id);
      defaultUpdateDep.changed();
    }else{
      $(e.target).prop('checked', true);
    }
  },
  'click .edit': function(){
    this.editMode = ! this.editMode;
  },
  'click .cancel': function(){
    this.editMode = false;
  },
  'click .save': function(e, ctx){
    var displayName= ctx.$('#' + this._id).val();
    if (!displayName) return;
    LookUps.update({_id: this._id},{ $set: { displayName: displayName } });
    this.editMode = false;
  },
  'click .save_lookupAction': function(e, ctx){
        var newlookupAction=ctx.$('#' + this._id+'newlookupAction').val();
        LookUps.update({_id: this._id},{$addToSet: {lookupActions: newlookupAction}} );
        console.log(LookUps.findOne({_id: this._id}));
        this.editMode = false;
  },

  'change .inactive': function(e){
    LookUps.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  }
};

Template.addNewLookUpItem.events({
  'click #add-item': function() {
    var newValue = $('#new-item').val();
    var lookUpTypeCode = query.codeType.value;
    if (!newValue)
      return;

    LookUps.insert({
      displayName: newValue,
      codeType: lookUpTypeCode,
      hierId: Meteor.user().hierId
    })
  }
})

NoteSchema = new SimpleSchema({
  msg: {
    type: String,
    label: 'Message'
  },
  links: {
    type: [Object],
    label: 'Entities linked'
  },
  'links.$.id': {
    type: String
  },
  'links.$.type': {
    type: Number,
    allowedValues: _.map(Enums.linkTypes, function (type) { return type.value; })
  }
});

// List
var NotesHandler;
Template.notesTabList.helpers({
  created: function () {
    var self = this;
    if (!SubscriptionHandlers.NotesHandler){
      SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe('notes');
    }
    NotesHandler = SubscriptionHandlers.NotesHandler;

    Meteor.autorun(function () {
      var searchQuery = {
        links: {
          $elemMatch: {
            id: Session.get('entityId')
          }
        }
      };

      NotesHandler.setFilter(searchQuery);
    });
  },
  items: function() {
    return Notes.find();
  }
});

// Record

Template.notesTabItem.helpers({
  getCtx: function () {
    var self = this;
    return {
      noteRecord: self,
      isEditing: new ReactiveVar(false)
    };
  },
  isEditing: function () {
    return this.isEditing.get();
  },
  getEntity: Utils.getEntityFromLink,
  getUrl: Utils.getHrefFromLink
});

Template.notesTabItem.events({
  'click .deleteNoteRecord': function () {
    var id = this.noteRecord._id;

    Utils.showModal('basicModal', {
      title: 'Delete note',
      message: 'Are you sure you want to delete this note?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Delete', classes: 'btn-danger', value: true}],
      callback: function (result) {
        if (result) {
          Notes.remove({_id: id});
        }
      }
    });
  },
  'click .editNoteRecord': function () {
    // Open edit mode
    this.isEditing.set(!this.isEditing.get());
  }
});

// Edit record

Template.notesTabEditItem.helpers({
  created: function () {
    var self = this;

    self.data.formId = Random.hexString(10);
  }
});

Template.notesTabEditItem.events({
  'click .cancelNoteRecordChanges': function () {
    // Close edit mode
    var ctx = Template.parentData(1);
    ctx.isEditing.set(!ctx.isEditing.get());
  }
});

// Links

AutoForm.inputValueHandlers({
  '#links-value': function () {
    var ctx = UI.getData(this[0]);
    return ctx.links;
  }
});

Template.linksAutoForm.helpers({
  created: function () {
    var self = this;
    var ctx = Template.parentData(1);

    var initialLink = {
      id: ctx._id,
      type: Utils.getEntityTypeFromRouter()
    };

    self.data.links = self.data.value || [initialLink];
    self.data.typeDep = new Tracker.Dependency();
    self.data.linkedDep = new Tracker.Dependency();

    // TODO: Find another way to reset links when form is submitted
    var formTemplate = UI.getView().parentView.parentView.parentView.parentView.parentView.parentView;
    formTemplate.template.events({
      'reset form': function () {
        self.data.links = [initialLink];
        self.data.linkedDep.changed();
      }
    });
  },
  links: function () {
    this.linkedDep.depend();
    return this.links;
  },
  types: function(){
    return _.map(_.keys(Enums.linkTypes),function(key){
      return Enums.linkTypes[key];
    })
  },
  entities: function(){
    this.typeDep.depend();
    var DOM = UI.getView()._domrange;
    if (!DOM)
      return;

    var selectedType = DOM.$('#noteTypeSelect').val();
    selectedType=parseInt(selectedType);
    switch (selectedType){
      case Enums.linkTypes.contactable.value:
        Meteor.subscribe('allContactables',{ Customer: { $exists: true } });
        return Contactables.find();
      case Enums.linkTypes.job.value:
        Meteor.subscribe('allJobs');
        return Jobs.find();
      case Enums.linkTypes.placement.value:
        var handler = Meteor.subscribe('allPlacements');
        handler.ready();
        return Placements.find();
      default :
        return [];
    }
  },
  getEntity: Utils.getEntityFromLink
});

var link = function(ctx, link){

};

Template.linksAutoForm.events({
  'change #noteTypeSelect': function(){
    var ctx = Template.parentData(0);
    ctx.typeDep.changed();
  },
  'click #noteLinkEntity': function () {
    var ctx = Template.parentData(0);
    var type= UI.getView()._templateInstance.$('#noteTypeSelect').val();
    type = parseInt(type);
    var entity = UI.getView()._templateInstance.$('#noteEntitySelect').val();
    if (!_.isNumber(type) || ! entity) return;

    var link = {
      type: type,
      id: entity
    };

    if (_.findWhere( ctx.links, {id: link.id})) return;

    ctx.links.push(link);
    ctx.linkedDep.changed();
  },
  'click .remove-link': function(){
    var ctx = Template.parentData(0);
    var links = ctx.links;
    Template.parentData(0).links = _(links).without(this);
    ctx.linkedDep.changed();
  }
});
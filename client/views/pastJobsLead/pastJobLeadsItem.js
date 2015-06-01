Template.pastJobLeadsItem.helpers({
  editingComent: function(){
       return this.isEditing.get();
  },
  getCtx: function(){
    this.isEditing = new ReactiveVar(false);
    return this;
  }

})

Template.pastJobLeadsItem.events({
  "change #active": function(e){
    Meteor.call('setActive', e.target.value, e.target.checked, function(err, r){
    });
  },
  "click #editing-active": function(e){
    this.isEditing.set(!this.isEditing.get())
  },
  "click #save-comment": function(e){
    var self = this;
    Meteor.call('setComment', e.target.value,$("#comment")[0].value, function(){
      var editing = self.isEditing.get();
      self.isEditing.set(!editing);
    });
  }
})
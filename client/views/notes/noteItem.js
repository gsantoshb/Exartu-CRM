Template.noteItem.helpers({
  noteClass: function(){
    return 'note-' + this.state + (this.inactive ? ' inactive' : '');
  },
  getHref: function(){
    return Utils.getHrefFromLink(this);
  },
  getEntity: function(){
    return Utils.getEntityFromLink(this);
  },
  isMe: function(){
    return (Meteor.userId() == this._id) ? 'text-info' : '';
  }
})
Template.noteItem.events({
  'click .editNote': function () {
    Composer.showModal('addEditNote', this)
  }
});
Template.noteItem.formatMsg = function(msg) {
  return msg.replace(/\r?\n/g,'<br/>');
};



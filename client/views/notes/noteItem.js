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
  },
  capMsglength: function () {
    var lastWord = this.msg.indexOf(' ', 299);
    return lastWord === -1 ? this.msg : this.msg.substring(0, lastWord) + '...';
  }
});

Template.noteItem.events({
  'click .editNote': function () {
    Utils.showModal('addEditNote', this)
  }
});
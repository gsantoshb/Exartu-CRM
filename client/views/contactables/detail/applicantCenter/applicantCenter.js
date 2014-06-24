Template.applicantCenter.helpers({
  isInvited: function(){
    return !! this.entity.invitation;
  },
  isRegistered: function(){
    return !! this.entity.user;
  },
  email: function(){
    var email= _.findWhere(this.entity.contactMethods, { typeEnum: Enums.contactMethodTypes.email } );
    return email && email.value;
  }
});

Template.applicantCenter.events({
  'click .invite':function(e, ctx){
    var email=ctx.$('.email').val();


    Meteor.call('sendInvitation', this.entity._id, email, function(err, result){
      if (err){
        console.dir(err);
      }
    })
  }
})
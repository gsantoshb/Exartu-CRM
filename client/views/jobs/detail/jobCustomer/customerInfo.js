Template.customerInfo.helpers({
  customer:function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    var q={};
    q._id= job.customer ? job.customer : null;
    return Contactables.findOne(q);
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  contactMethod: function(index){
    return this.contactMethods[index];
  }
})
Template.customerInfo.events({
  'click .addEdit':function(){
    Composer.showModal( 'jobCustomerAddEdit', Session.get('entityId'));
  }
});
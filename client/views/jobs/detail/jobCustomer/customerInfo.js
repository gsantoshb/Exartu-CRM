Template.customerInfo.helpers({
  customer:function(){
    var CustomerId= this.customer;
    return Contactables.findOne({
      _id: CustomerId
    });
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  contactMethod: function(index){
    if (!this.contactMethods) return;
    return this.contactMethods[index];
  }
})
Template.customerInfo.events({
  'click .addEdit':function(e, ctx){
    Composer.showModal( 'jobCustomerAddEdit', Session.get('entityId'), ctx.data.customer, ctx.data.path, ctx.data.collection);
  }
});
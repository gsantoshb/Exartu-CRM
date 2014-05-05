Template.contactableCustomer.events({
  'click .add-edit': function(){
//      debugger;
        Composer.showModal( 'contactCustomerAddEdit',Session.get('entityId'));
    }
});

Template.contactableCustomer.helpers({
    customerInfo: function(){
        return Contactables.findOne({
            _id: this.customer
        })
    },
    customerPicture: function(){
        if (this.pictureFileId){
            return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
        }
        return "/assets/user-photo-placeholder.jpg";
    }
})
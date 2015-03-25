var collection;
var client = new ReactiveVar();
var clientId = undefined;

Template.contactClientInfo.created = function(){
    clientId = this.data.client;
    Meteor.subscribe('singleContactable', clientId);
    //collection = this.data.collection;
};

Template.contactClientInfo.helpers({
    client: function () {
        return Contactables.findOne({_id: clientId});
    },
    pictureUrl: function () {
        if (this.pictureFileId) {
            return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
        }
        return "/assets/user-photo-placeholder.jpg";
    },
    contactMethod: function (index) {
        if (!this.contactMethods) return;
        return this.contactMethods[index];
    }
});

Template.contactClientInfo.events({
    'click .addEdit': function (e, ctx) {
        Utils.showModal('contactClientAddEdit', Session.get('entityId'), ctx.data.client, function (clientId) {
        });
    }
});
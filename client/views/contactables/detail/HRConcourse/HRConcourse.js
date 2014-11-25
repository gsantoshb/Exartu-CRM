Template.HRConcourse.helpers({
  isInvited: function(){
    return !!this.entity.invitation;
  },
  isRegistered: function(){
    return !!this.entity.user;;
  },
  email: function() {
    var contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();
    var email = _.find(this.entity.contactMethods, function (cm) {
      var type = _.findWhere(contactMethodsTypes, { _id: cm.type });
      if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email))
        return true;
    });
    return email && email.value;
  },
  documents: function() {
    var hierDocuments = DocCenter.getDocuments().fetch();
    var entityRevisionInstances = DocCenter.getEntityRevisionInstances(contactableId).fetch();

    return _.map(hierDocuments, function(document) {
      var instances = [];
      _.forEach(entityRevisionInstances, function(entityRevisionInstance) {
        if (_.contains(document.revisions, entityRevisionInstance.revisionId)) {
          var obj = {};
          _.extend(obj, entityRevisionInstance);
          instances.push(obj);
        }
      });

      if (!_.isEmpty(instances)) {
        document.instances = instances;

        _.forEach(instances, function(instance) {
          if (instance.revisionId == document.currentRevisionId)
            if (!document.currentRevisionInstance || (document.currentRevisionInstance && document.currentRevisionInstance.createdAt < instance.createdAt))
              document.currentRevisionInstance = instance;
        });
      }

      return document;
    });
  }
});

var contactableId;
Template.HRConcourse.created = function() {
  contactableId = this.data.entity._id;
};

Template.HRConcourse.events({
  'click .invite':function(e, ctx){
    var email=ctx.$('.email').val();

    Meteor.call('sendInvitation', this.entity._id, email, function(err, result){
      if (err) {
        console.dir(err);
        alert(err);
      } else {
        alert('Invitation sent');
      }
    })
  },
  'click .send-document': function() {
    var currentDocumentRevision = this.getCurrentRevision();
    var revInstance = new DocCenter.RevisionInstance({entityId: contactableId}, currentDocumentRevision);
  }
});
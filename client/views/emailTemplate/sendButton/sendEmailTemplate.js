Template.sendEmailTemplate.helpers({});

Template.sendEmailTemplate.events({
  'click .btn': function () {
    if (!this.recipient){
      $.gritter.add({
        title:	'Unable to send email',
        text:	'You must add an email first',
        image: 	'/img/logo.png',
        sticky: false,
        time: 2000
      });
    }else{
      Utils.showModal('sendEmailTemplateModal', this);
    }
  }
});
var missingTypes = [];
var missingTypesDep = new Deps.Dependency;

var preview = new ReactiveVar();

var templateId = new ReactiveVar();
var sending = new ReactiveVar();
var entities;
Template.sendEmailTemplateModal.created= function() {
    Meteor.subscribe('emailTemplates');
    Meteor.subscribe('emailTemplateMergeFields');
    Meteor.subscribe('allEmailTemplates');
    preview.set('');
    missingTypes = [];
    entities = [];
};
Template.sendEmailTemplateModal.helpers({
  templates: function () {

    var context = this[0], q = context.category ? {category : context.category} : {};
      console.log('this',q,context.category);
    return AllEmailTemplates.find(q);
  },
  missingTypes: function () {
    missingTypesDep.depend();
    return missingTypes;
  },
  objTypeQuery: function () {
    var mf = this;
    switch (mf.objType){
      case 'Customer':
        return function (string) {
          var self = this;
          return Meteor.call('findCustomer', string, function (err, result) {
            if (err)
              return console.log(err);
            self.ready(_.map(result, function (r) {
                return { id: r._id, text: r.organization.organizationName};
              })
            );
          });
        };
      case 'Employee':
        return function (string) {
          var self = this;
          return Meteor.call('findEmployee', string, function (err, result) {
            if (err)
              return console.log(err);
            self.ready(_.map(result, function (r) {
                return { id: r._id, text: r.person.firstName + ', ' + r.person.lastName };
              })
            );
          });
        };
      case 'job':
        return function (string) {
          var self = this;
          return Meteor.call('findJob', string, function (err, result) {
            if (err)
              return console.log(err);
            self.ready(_.map(result, function (r) {
                return { id: r._id, text: r.publicJobTitle };
              })
            );
          });
        };
    }
  },
  entitySelected: function () {
    var self= this;
    return function (value) {
      _.each(self.mfIds, function (mfId) {
        entities.push({
          entityId: value,
          mergeFieldId: mfId
        });
      });
      var index = missingTypes.indexOf(self);
      missingTypes.splice(index, 1);
      if (missingTypes.length == 0){
        instantiate();
      }
      missingTypesDep.changed();
    }
  },
  preview: function () {
    return preview.get();
  },
  disableSend: function () {
    missingTypesDep.depend();
    return  sending.get() || templateId.get() == undefined || missingTypes.length > 0;
  }
});
Template.sendEmailTemplateModal.events({
  'change #template': function (e, ctx) {
    templateId.set(e.target.value);
    var template = EmailTemplates.findOne(e.target.value),
      mergeFields = getMergeFields(template),
      context = this[0];
    resolveMergeFields(mergeFields, context);
  },
  'click #manageTemplate': function () {
    Utils.dismissModal();
  },
  'click #send': function () {
    var context = this[0];

    sending.set(true);
    Meteor.call('sendEmailTemplate', templateId.get(), entities, context.recipient, function (err, result) {
      if (err){
        console.log(err);
      }else{
        Utils.dismissModal();
      }
      sending.set(false);
    });
  }
});

var patternFind = /data-mergefield="(\w+)"/g;

var resolveMergeFields = function (mergeFields, context) {
  entities = [];

  _.each(mergeFields, function (mf) {
    if (context[mf.name]){
      entities.push({
        entityId: context[mf.name],
        mergeFieldId: mf._id
      })
    }else if(context[mf.objType]){
      entities.push({
        entityId: _.isArray(context[mf.objType]) ? false : context[mf.objType],
        mergeFieldId: mf._id
      })
    }else{
      var missingEntity =_.findWhere(missingTypes, { objType: mf.objType });
      if (!missingEntity){
        missingTypes.push({objType: mf.objType, mfIds: [mf._id]});
      }else{
        missingEntity.mfIds.push(mf._id);
      }
    }
  });

  if (missingTypes.length){
    missingTypesDep.changed();
  }else{
    instantiate();
  }
};
var getMergeFields= function (template) {
  var match; //= template.text.match(patternFind);
  var result= [];
  while (match = patternFind.exec(template.text)){
    if (match && match.length > 0){
      result.push(EmailTemplateMergeFields.findOne(match[1]));
    }
  }
  return result;
};

var instantiate = function () {
  if(!templateId.get()) return;
  Meteor.call('getTemplateInstance', templateId.get(), entities, function (err, res) {
    if (err){
      console.log(err);
    }else{
      preview.set(res);
    }
  })
};

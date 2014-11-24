Template.sendTemplate.helpers({});

Template.sendTemplate.events({
  'click .btn': function () {
    Utils.showModal('sendTemplateModal', this);
  }
});
var missingTypes = [];
var missingTypesDep = new Deps.Dependency;

var preview = [];
var previewDep = new Deps.Dependency;

var templateId;
var entities;
Template.sendTemplateModal.helpers({
  created: function () {
    console.log(this.data);
    Meteor.subscribe('emailTemplates');
    Meteor.subscribe('emailTemplateMergeFields');
    preview = '';
    missingTypes = [];
    entities = [];
  },
  templates: function () {
    return EmailTemplates.find();
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
      var index = missingTypes.indexOf(this);
      missingTypes.splice(index, 1);
      if (missingTypes.length == 0){
        instantiate();
      }
      missingTypesDep.changed();
    }
  },
  preview: function () {
    previewDep.depend();
    return preview;
  }
});
Template.sendTemplateModal.events({
  'change #template': function (e, ctx) {
    templateId = e.target.value;
    var template = EmailTemplates.findOne(templateId),
      mergeFields = getMergeFields(template),
      context = this[0];
    resolveMergeFields(mergeFields, context);
  },
  'click #manageTemplate': function () {
    Utils.dismissModal();
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
        entityId: context[mf.objType],
        mergeFieldId: mf._id
      })
    }else{
      var missingEntity =_.findWhere(missingTypes,{objType: mf.objType});
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
  if(!templateId) return;
  console.log(entities);
  Meteor.call('getTemplateInstance', templateId, entities, function (err, res) {
    if (err){
      console.log(err);
    }else{
      preview = res;
      previewDep.changed();
    }
  })
};

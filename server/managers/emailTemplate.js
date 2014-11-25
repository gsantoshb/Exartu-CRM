var patternFind = /data-mergefield="(\w+)"/g;
var getPatternReplace = function (id) {
  return new RegExp("<[^><]*data-mergefield=\"" + id + "\"[^><]*>");
};

EmailTemplateManager = {
  createTemplate: function (template) {
    return EmailTemplates.insert(template);
  },
  instantiateTemplate: function (templateId, entities) {
    var template = EmailTemplates.findOne(templateId);
    if (!template) throw new Error('template not found');

    var result = template.text;

    var mergeFields = getMergeFields(template);

    _.each(mergeFields, function (mf) {
        var value = getMergeFieldValue(mf, entities);
        result = result.replace(getPatternReplace(mf._id), value);
    });

    return result;
  },
  getPreview: function (text) {
    //var template = EmailTemplates.findOne(templateId);
    //if (!template) throw new Error('template not found');

    var result = text;

    var mergeFields = getMergeFields({text: text});

    _.each(mergeFields, function (mf) {
      var value = mf.testValue;
      result = result.replace(getPatternReplace(mf._id), value);
    });

    return result;
  },
  sendTemplate: function (templateId, entities, recipient) {
    var text = this.instantiateTemplate(templateId, entities);
    var template = EmailTemplates.findOne(templateId);

    Meteor.call('sendEmail', recipient, template.name, text, true);
    Emails.insert({
      to: recipient,
      text: text,
      userId: Meteor.userId(),
      templateId: template._id
    })
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

var getMergeFieldValue = function (mergeField, entities) {
  var entityId = _.findWhere(entities,{mergeFieldId: mergeField._id});

  if (!entityId) throw new Error('Missed entity for mergeField ' +  mergeField.name );
  entityId = entityId.entityId;
  var collection = dType.core.getCollectionOfType(mergeField.objType);

  var entity = collection.findOne(entityId);

  if (!entity || !_.contains(entity.objNameArray, mergeField.objType)) throw new Error('entity for mergeField ' +  mergeField.name + ' not valid');

  var path = mergeField.path;
  var tmpObj = entity;
  path = path.split('.');
  for(var i = 0; i< path.length -1; ++i){
    tmpObj = tmpObj[path[i]];
  }

  var value = tmpObj[path[path.length -1]];
  if (EmailTemplateMergeFields.formatValues && EmailTemplateMergeFields.formatValues[mergeField._id]){
    return EmailTemplateMergeFields.formatValues[mergeField._id](value);
  }else{
    return value;
  }

};


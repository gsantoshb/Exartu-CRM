Utils = {};

_.extend(Utils, {
  getUserInformation: function(userId) {
    var user = Meteor.users.findOne({_id: userId});
    if(!user)return null

    user.picture=UsersFS.getThumbnailUrlForBlaze(user.profilePictureId);

    return {
      username: user.username,
      picture: user.picture || '/assets/user-photo-placeholder.jpg'
    };
  }
});

// Prop template
Utils.reactiveProp=function(object, key, value){
  var depName='_dep'+key;
  var valueName='_'+key;
  object[depName]= new Deps.Dependency;
  object[valueName]= value;

  Object.defineProperty(object, key,{
    get:function(){
      this[depName].depend();
      return this[valueName];
    },
    set:function(newValue){
      this[valueName]=newValue;
      this[depName].changed();
    }
  })
}

Utils.ReactivePropertyTypes = {
  string: 'string',
  int: 'number',
  array: 'array',
  date: 'date',
  boolean: 'boolean',
  lookUp: 'lookUp'
};

Utils.ObjectDefinition = function(definition) {
  var self = {};

  // Reactives properties
  _.forEach(_.keys(definition.reactiveProps), function(propName) {
    self[propName] = {};

    var prop = self[propName];
    prop.reactive = true;
    prop.dep = new Deps.Dependency;
    prop.cb = definition.reactiveProps[propName].cb;

    switch(definition.reactiveProps[propName].type) {
      case Utils.ReactivePropertyTypes.array:
        prop.type = Utils.ReactivePropertyTypes.array;
        prop.default  = _.clone(definition.reactiveProps[propName].default) || [];
        prop.val =  _.clone(prop.default);
        Object.defineProperty(prop, "value", {
          get: function () {
            this.dep.depend();
            return this.val;
          },
          set: function (newValue) {
            this.val = newValue;
            this.dep.changed();
            this.error.hasError = !prop.validator();
          }
        });
        prop.insert = function(newValue) {
          this.val.push(newValue);
          this.dep.changed();
          if (this.cb && this.cb.onInsert)
            this.cb.onInsert(newValue);
        };
        prop.remove = function(element) {
          this.val = _.without(this.value, _.findWhere(this.value, element));
          this.dep.changed();
          if (this.cb && this.cb.onRemove)
            this.cb.onRemove(element);
        };

        break;
      default:
        function defaultValue(prop) {
          if (definition.reactiveProps[propName].default != undefined)
            return definition.reactiveProps[propName].default;

          switch (prop.type) {
            case Utils.ReactivePropertyTypes.date: return null;
            default: return '';
          }
        };

        prop.type = definition.reactiveProps[propName].type || Utils.ReactivePropertyTypes.string;
        prop.val = defaultValue(prop);
        prop.default  = definition.reactiveProps[propName].default || '';
        Object.defineProperty(prop, "value", {
          get: function () {
            this.dep.depend();
            return this.val;
          },
          set: function (newValue) {
            if (this.val == newValue) return;
            this.val = newValue;
            this.dep.changed();
            this.error.hasError = !prop.validator();
          }
        });
        break;
    };

    if (!prop.fieldType){
      prop.fieldType=definition.reactiveProps[propName].type;
    }

    prop.error = {};
    prop.error.dep = new Deps.Dependency;
    prop.error.error = false;
    prop.error.message = definition.reactiveProps[propName].errorMessage || 'Incorrect value';
    Object.defineProperty(prop.error, "hasError", {
      get: function () {
        this.dep.depend();
        return this.error;
      },
      set: function (newValue) {
        this.error = newValue;
        this.dep.changed();
      }
    });


    if (definition.reactiveProps[propName].validator) {
      prop.validator = function() {
        return definition.reactiveProps[propName].validator.call(this);
      }
    }
    else
      prop.validator = function() { return true; }; // Always validate

    if(definition.reactiveProps[propName].options){
      prop.options=definition.reactiveProps[propName].options
    }
    if(definition.reactiveProps[propName].displayName){
      prop.displayName=definition.reactiveProps[propName].displayName
    }
  });

  // Not reactive properties
  _.forEach(_.keys(definition), function(propName) {
    self[propName] = definition[propName];
    var prop = self[propName];
    if (propName != 'reactiveProps') {
      prop.validator = function() { return true; }; // Always validate
    };
  });

  self.getObject = function() {
    var obj = {};
    _.forEach(_.keys(self), function(propName) {
      var prop = self[propName];
      if (prop.reactive) {
        obj[propName] =prop.value;
      }
      else
        obj[propName] = prop;
    });

    return obj;
  };

  self.isValid = function() {
    return _.every(_.keys(definition.reactiveProps), function(propName) {
      return self[propName].validator? self[propName].validator() : true;
    });
  };

  self.showErrors = function() {
    _.forEach(_.keys(self.reactiveProps), function(propName) {
        self[propName].error.hasError = !(self[propName].validator? self[propName].validator() : true);
      }
    );
  };

  self.reset = function() {
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
        var defaultValue = definition.reactiveProps[propName].default;
        switch(definition.reactiveProps[propName].type) {
          case Utils.ReactivePropertyTypes.string:
            self[propName].value = defaultValue || '';
            break;
          case Utils.ReactivePropertyTypes.int:
            self[propName].value= defaultValue || 0;
            break;
          case Utils.ReactivePropertyTypes.array:
            self[propName].value = defaultValue || [];
            break;
          default:
            self[propName].value = defaultValue || '';
            break;
        };
        self[propName].error.hasError = false;
      }
    );
    _.forEach(_.keys(definition), function(propName) {
      if (propName != 'reactiveProps') {
        self[propName] = undefined;
      };
    });
  };

  self.generateUpdate = function() {
    var update = {
      $set: {}
    };

    _.forEach(_.keys(definition.reactiveProps), function(propName) {
        var propertyUpdatePath = definition.reactiveProps[propName].update;
        if (self[propName].value != definition.reactiveProps[propName].default && propertyUpdatePath)
          update.$set[propertyUpdatePath] = self[propName].value
    });

    return update;
  };

  self.updateDefaults = function() {
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
      definition.reactiveProps[propName].default = self[propName].value;
    });
  };

  return self;
};

Utils.Validators = {};
Utils.Validators.stringNotEmpty = function() {
  return !_.isEmpty(this.value);
}

Utils.getLocation = function (googleLocation) {
  if (!googleLocation || !googleLocation.address_components) return undefined;

  var address, city, state, country, postalCode, streetNumber;
  _.forEach(googleLocation.address_components, function(component) {
    if (_.findWhere(component.types, 'route'))
      address = component.long_name;
    if (_.findWhere(component.types, 'locality'))
      city = component.long_name;
    if (_.findWhere(component.types, 'administrative_area_level_1'))
      state = component.long_name;
    if (_.findWhere(component.types, 'country'))
      country = component.long_name;
    if (_.findWhere(component.types, 'postal_code'))
      postalCode = component.long_name;
    if (_.findWhere(component.types, 'street_number'))
      streetNumber = component.long_name;
  });

  return {
    displayName: googleLocation.formatted_address,
    lat: googleLocation.geometry.location.lat(),
    lng: googleLocation.geometry.location.lng(),
    address: address,
    city: city,
    state: state,
    country: country,
    postalCode: postalCode,
    streetNumber: streetNumber
  }
};

Utils.getLocationDisplayName = function (location) {
  return !location ? '' : (
  (location.streetNumber || '' ) + ' '  +
  (location.address  || '' ) + ' '  +
  (location.address1 || '' ) + ', ' +
  (location.city     || '' ) + ', ' +
  (location.state    || '' ) + ', ' +
  (location.country  || '' ));
};

Utils.getLinkTypeFromEntity=function(entity) {
    var objNameArray=entity.objNameArray;
    if (objNameArray && objNameArray.length>0)
        return entity.objNameArray[objNameArray.length-1];
    return null;
}

Utils.getHrefFromEntity=function(entity)
{
    var linktype=Utils.getLinkTypeFromEntity(entity);
    if (linkType)
    {
        var link={};
        link.type=linkType;
        link.id=entity._id;
        return Utils.getHrefFromLink(link);

    }
    return null;
}
Utils.getEntityFromLink=function(link){
  switch (link.type){
    case Enums.linkTypes.contactable.value:
      return Contactables.findOne({_id: link.id});
    case Enums.linkTypes.job.value:
      var job = Jobs.findOne({_id: link.id});
      if (! job) return;
      // Extend displayName with customer displayName
      var customer = AllContactables.findOne(job.customer);
      job.displayName += '@' + customer.displayName;
      return job;
    case Enums.linkTypes.deal.value:
        return Deals.findOne({_id: link.id});
    case Enums.linkTypes.placement.value:
        return Placements.findOne({_id: link.id});
    case Enums.linkTypes.candidate.value:
        return Candidates.findOne({_id: link.id});
  }
}
Utils.getEntityFromLinkForAdd=function(link){
  switch (link.type){
    case Enums.linkTypes.contactable.value:
      return AllContactables.findOne({_id: link.id});
    case Enums.linkTypes.job.value:
      return AllJobs.findOne({_id: link.id});
    case Enums.linkTypes.deal.value:
        return Deals.findOne({_id: link.id});
    case Enums.linkTypes.placement.value:
        return AllPlacements.findOne({_id: link.id});
    case Enums.linkTypes.candidate.value:
        return AllPlacements.findOne({_id: link.id});
  }
}

Utils.getEntitiesFromType=function(type){
    switch (type) {
        case Enums.linkTypes.contactable.value:
            return Contactables.find();
        case Enums.linkTypes.job.value:
            return Jobs.find();
        case Enums.linkTypes.deal.value:
            return Deals.find();
        case Enums.linkTypes.placement.value:
            return Placements.find();
        case Enums.linkTypes.candidate.value:
            return Candidates.find();
        default :
        return [];
    }
}
Utils.getTypeFromTypeString=function (str)
{

  for (var k in Enums.linkTypes) {

    var estr=Enums.linkTypes[k].displayName;

    if (estr == str.toLowerCase() || estr == (str + 's').toLowerCase()) return k;
  }
  return null;
}

Utils.getCollectionFromEntity=function(entity) {
  var strtype=Utils.getLinkTypeFromEntity(entity);
  if ($.inArray(strtype, ['Employee','Contact','Customer','contactable'])!=-1) return Contactables;
  if ($.inArray(strtype, ['Job','job'])!=-1) return Jobs;
  if ($.inArray(strtype, ['Deal','deal'])!=-1) return Deals;
  if ($.inArray(strtype, ['Placement','placement'])!=-1) return Placements;
  if ($.inArray(strtype, ['Candidate','candidate'])!=-1) return Candidates;
}

Utils.getCollectionFromType=function(type){
  switch (type) {
    case Enums.linkTypes.contactable.value:
      return ContactablesFS;
    case Enums.linkTypes.job.value:
      return Jobs;
    case Enums.linkTypes.deal.value:
      return Deals;
    case Enums.linkTypes.placement.value:
      return Placements;
    case Enums.linkTypes.candidate.value:
      return Candidates;
    default :
      return [];
  }
}

Utils.getHrefFromLink=function(link){
  switch (link.type){
    case Enums.linkTypes.contactable.value:
      return '/contactable/'+ link.id;
    case Enums.linkTypes.job.value:
      return '/job/'+ link.id;
      case Enums.linkTypes.deal.value:
          return '/deal/'+ link.id;
      case Enums.linkTypes.placement.value:
          return '/placement/'+ link.id;
      case Enums.linkTypes.candidate.value:
          return '/candidate/'+ link.id;
  }
};


Utils.toReactiveObject=function(addModel, obj){
  var reactiveObj={
    _id: obj._id,
    reactiveProps: {}
  }
  var object=obj;
  var path='';
  var props={};
  _.each(addModel.fieldGroups,function(fieldGroup){
    _.each(fieldGroup.items,function(item){
      if(item.type=='field'){
        props[item.name]=getDefinitionFromField(item, object, path);

      }
    })
  })
  _.each(addModel.subTypes,function(subType){
    path=subType.name + '.';
    object=obj[subType.name];
    _.each(subType.fieldGroups,function(fieldGroup){
      _.each(fieldGroup.items,function(item){
        if(item.type=='field'){
          props[item.name]=getDefinitionFromField(item, object, path);
        }
      })
    })
  })

  _.extend(reactiveObj.reactiveProps, props);
  return reactiveObj;
}

var getDefinitionFromField=function(field, obj, path){
  var type;
  switch (field.fieldType){
    case 'string':
      type=Utils.ReactivePropertyTypes.string;
      break;
    case 'date':
      type=Utils.ReactivePropertyTypes.date;
      break;
    case 'number':
      type=Utils.ReactivePropertyTypes.int;
      break;
    case 'lookUp':
      type=Utils.ReactivePropertyTypes.lookUp;
      break;

  }

  var result={
    default: obj[field.name],
    update: path+ field.name,
    type: type
  }
  if(type==Utils.ReactivePropertyTypes.lookUp){
    var displayName=obj[field.name+'Name'];
    var lookup=LookUps.findOne({_id: obj[field.name]});
    if (displayName==null && lookup!=null)  displayName= LookUps.findOne({_id: obj[field.name]}).displayName;
    result.displayName=displayName;
    result.options=LookUps.find({$or: [
                                        {lookUpCode: field.lookUpCode, inactive: {$ne: true}},
                                        {_id: obj[field.name] }
                                ] }, { sort: {displayName: 1} });
  }
  return result;
};
Utils.getLookUpsByCode=function(code)
{
    LookUps.find({lookUpCode: code, inactive: {$ne: true}}, { sort: {displayName: 1} });
};

Utils.getEntityTypeFromRouter=function()
{
  switch (Router.current().route.name) {
    case 'contactable':
      return Enums.linkTypes.contactable.value;
      break;
    case 'job':
      return Enums.linkTypes.job.value;
      break;
    case 'deal':
      return Enums.linkTypes.deal.value;
    case 'placement':
      return Enums.linkTypes.placement.value;
    case 'candidate':
      return Enums.linkTypes.candidate.value;
      break;
    default :
      return null;
  }
}
Utils.getEntitiesFromType=function(type)
{
  switch (selectedType){
    case Enums.linkTypes.contactable.value:
      return Contactables.find();
    case Enums.linkTypes.job.value:
      return Jobs.find();
    case Enums.linkTypes.deal.value:
      return Deals.find();
    case Enums.linkTypes.placement.value:
      return Placements.find();
    case Enums.linkTypes.candidate.value:
      return Candidates.find();
    default :
      return [];
  }
}

Utils.getContactableType = function(entity) {
  if (entity.Customer)
    return 'Customer';
  if (entity.Employee)
    return 'Employee';
};



Utils.showModal = function (templateName) {
  var body = $('body');
  var host = body.find(".modal-host")[0];
  if (!host) {
    host = $('<div class="modal-host"> </div>').appendTo(body);
  } else {
    host = $(host);
  }
  _.each(host.children(), function (m) {
    m = $(m);
    m.modal('toggle');
    m.remove();
    $('.modal-backdrop').remove();
  });

  var parameters = Array.prototype.slice.call(arguments, 1);

  var template = Template[templateName];

  UI.insert(UI.renderWithData(template, parameters), host[0]);
  var modal = host.children();

  modal.modal('show');

  modal.on('hidden.bs.modal', function (e) {
    modal.remove();
  });
};
Utils.dismissModal = function () {
  $('.modal-host').children().modal('toggle');
};
Utils.getContactableType= function(obj) {
  if (obj.Customer)
    return 'Customer';
  if (obj.Employee && obj.Contact)
    return 'Employee/Contact';
  if (obj.Employee)
    return 'Employee';
  if (obj.Contact)
    return 'Contact';
};
Utils.getDefaultJobStatus=function()
{
  var defaultStatus=LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,isDefault:true});
  if (defaultStatus) defaultStatus=LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode});
  if (defaultStatus) return defaultStatus._id; else return null;
}

Utils.setDecimal= function(rate) {
  var drate = parseFloat(rate).toFixed(2);

  if (drate==null || isNaN(drate)) drate=0;
  return drate;
}
// Edit Rates


// CONTACT METHODS

Utils.contactMethodTypeIcon = function(type) {
  var contactMethod = LookUps.findOne({ _id: type, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode });

  if (contactMethod && contactMethod.lookUpActions) {
    if (_.contains(contactMethod.lookUpActions, Enums.lookUpAction.ContactMethod_Email)) {
      return 'fa fa-envelope-o';
    } else if (_.contains(contactMethod.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
      return 'fa fa-phone';
    }
  }
  
  return 'fa fa-comment-o';
};
Utils.contactMethodTypePrefix = function(type) {
  var contactMethod = LookUps.findOne({ _id: type, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode });

  if (contactMethod && contactMethod.lookUpActions) {
    if (_.contains(contactMethod.lookUpActions, Enums.lookUpAction.ContactMethod_Email)) {
      return 'mailto:';
    } else if (_.contains(contactMethod.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
      return 'callto:';
    }
  }

  return '';
};
Utils.users =function(){
  return Meteor.users.find({});
};

Utils.getPhoneNumberDisplayName = function (phoneNumber) {
  return phoneNumber;
//  return  '(' + phoneNumber.slice(1, 4) + ') ' + phoneNumber.slice(5, 8) + '-' + phoneNumber.slice(8, 12);
};

Template.registerHelper('getPhoneNumberDisplayName', function(phoneNumber) {
  return Utils.getPhoneNumberDisplayName(phoneNumber);
});

// URLQuery

URLQuery = function () {
  var self = this;
  self.params = {};
};

URLQuery.prototype.addParam = function (paramName, paramValue) {
  var self = this;
  self.params[paramName] = EJSON.clone(paramValue);
};

URLQuery.prototype.apply = function () {
  var self = this;

  var url = '';
  _.forEach(self.params, function (value, name) {
    url += (!url ? '?' : '&') + name + '=' + value;
  });

  history.replaceState(null, null, location.pathname + url);
};

Utils.getContactableEmail = function (contactable) {
  var result = null;
  var contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();
  _.every(contactable.contactMethods, function (cm) {
    var type = _.findWhere(contactMethodsTypes, { _id: cm.type });
    if (!type)
      return true; //keep looking
    if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email)){
      result = cm.value;
      return false; //finish
    }
  });
  return result;
};

Utils.getContactableMobilePhones = function (contactable) {
  var result = [];
  var contactMethodsTypes = Utils.getContactMethodTypes_MobilePhone();
  _.every(contactable.contactMethods, function (cm) {
    var type = _.findWhere(contactMethodsTypes, { _id: cm.type });
    if (!type)
      return true; //keep looking
    else
    {
      result.push(cm.value);
      return true;
    }
  });
  return result;
};
Utils.getContactableMobilePhone = function (contactable) {
  var result = Utils.getContactableMobilePhones(contactable);
  if (result.length>0) return result[0];
  return null;
};


Utils.getContactMethodTypes_Email = function () {
  return LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode, lookUpActions: "ContactMethod_Email" }).fetch()
};

Utils.getContactMethodTypes_MobilePhone = function () {
  return LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode, lookUpActions: "ContactMethod_MobilePhone" }).fetch()
};

Utils.extendContactableDisplayName = function (contactable) {
  if (contactable.person)
    contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
  if (contactable.organization)
    contactable.displayName = contactable.organization.organizationName;
};

Utils.getLocalUserName= function(user)
{
  return  user.emails[0].address.split('@')[0];
}
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
  console.log(googleLocation);
  return {
    displayName: googleLocation.formatted_address,
    lat: googleLocation.geometry.location.lat(),
    lng: googleLocation.geometry.location.lng()
  }
}

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
      return Jobs.findOne({_id: link.id});
    case Enums.linkTypes.deal.value:
          return Deals.findOne({_id: link.id});
      case Enums.linkTypes.matchup.value:
          return Matchups.findOne({_id: link.id});
      case Enums.linkTypes.candidate.value:
          return Candidates.findOne({_id: link.id});
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
        case Enums.linkTypes.matchup.value:
            return Matchups.find();
        case Enums.linkTypes.candidate.value:
            return Candidates.find();
        default :
        return [];
    }
}
Utils.getTypeFromTypeString=function (str)
{
  console.log(ObjTypes.find());
  for (var k in Enums.linkTypes) {

    var estr=Enums.linkTypes[k].displayName;
    console.log(str,estr);
    if (estr == str.toLowerCase() || estr == (str + 's').toLowerCase()) return k;
  }
  return null;
}

Utils.getCollectionFromEntity=function(entity) {
  var strtype=Utils.getLinkTypeFromEntity(entity);
  if ($.inArray(strtype, ['Employee','Contact','Customer','contactable'])!=-1) return Contactables;
  if ($.inArray(strtype, ['Job','job'])!=-1) return Jobs;
  if ($.inArray(strtype, ['Deal','deal'])!=-1) return Deals;
  if ($.inArray(strtype, ['Matchup','matchup'])!=-1) return Matchups;
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
    case Enums.linkTypes.matchup.value:
      return Matchups;
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
      case Enums.linkTypes.matchup.value:
          return '/matchup/'+ link.id;
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
                                        {codeType: field.lookUpCode, inactive: {$ne: true}},
                                        {_id: obj[field.name] }
                                ] }, { sort: {displayName: 1} });
  }
  return result;
};
Utils.getLookUpsByCode=function(code)
{
    LookUps.find({codeType: code, inactive: {$ne: true}}, { sort: {displayName: 1} });
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
    case 'matchup':
      return Enums.linkTypes.matchup.value;
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
    case Enums.linkTypes.matchup.value:
      return Matchups.find();
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

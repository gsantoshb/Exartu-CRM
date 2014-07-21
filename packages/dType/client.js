var getObjType=function(name){
    return  dType.ObjTypes.findOne({name: name});
}

dType.objInstance= function(obj, collection, grouped){
  var self=this;
  if (_.isString(obj)){
    var obj=collection.findOne(obj);
  }

  self._id=obj._id;
  self.collection=collection;

  var objTypes=dType.core.getObjTypes(obj);
  if (grouped){
    self.fieldGroups= {};
  }

  var addField=function(groups, groupName, item){
    if (grouped){
      addToFieldGroup2(groups, groupName, item)
    }else{
      self[item.name]=item;
    }
  }

  _(objTypes).each(function(objType){
    var object= objType.collection ? obj : obj[objType.name];
    self[objType.name]=true;

    _.each(objType.fields, function(field){
      addField(self.fieldGroups, field.fieldGroup, new fieldInstance2(field, object[field.name], objType, !!objType.collection));
    })

    var visibilities= dType.core.getRelationsVisivilityOnType(objType);
    _.each(visibilities, function(v){
      addField(self.fieldGroups, v.fieldGroup, new relation2(v));
    })

  })
}

dType.objInstance.prototype.validate= function(allFields){
  var items=this.toArray();
  return _.every(items, function(item){
    if (allFields || (item.value != item.savedValue)){
      if (item.isField){
        return item.validate();
      }
      if (item.isRelation){
        return item.validate();
      }
    }
    return true;
  })
}

dType.objInstance.prototype.getObject= function(){
  var obj={};
  _.each(this.toArray(), function(item){
    if (!item.path){
      obj[item.name]=item.value;
    }else{

      if (!obj[item.path] ){
        obj[item.path]={};
      }
      obj[item.path][item.name]=item.value;
    }
  })
  return obj;
}

dType.objInstance.prototype.getUpdate= function(){
  var upd={
    $set: {}
  };
  _.each(this.toArray(), function(item){
    if (item.value != item.savedValue){
      var selector= item.path ? item.path + '.' + item.name: item.name;
      upd.$set[selector]=item.value;
    }
  })
  return upd;
}
dType.objInstance.prototype.save= function(cb){
  this.collection.update({_id: this._id}, this.getUpdate(), cb)
}
dType.objInstance.prototype.showErrors=function(){
  _.each(this.toArray(), function(item){
    if (item.isField){
      item.validate();
    }
    if (item.isRelation){
      item.validate();
    }
  })
}
dType.objInstance.prototype.reset=function(){
  var object=this.collection.findOne(this._id)
  _.each(this.toArray(), function(item){
    var savedValue= item.path ? object[item.path][item.name]: object[item.name];
    item.savedValue=savedValue
    item.value=savedValue;
  })
}
dType.objInstance.prototype.toArray= function(){
  var self=this;
  var items=[];
  if (self.fieldGroups){
    _.each(_.keys(self.fieldGroups),function(groupName){
      _.each(_.keys(self.fieldGroups[groupName]),function(itemName){
        if (_.isObject(self.fieldGroups[groupName][itemName]))
          items.push(self.fieldGroups[groupName][itemName]);
      })
    })
  }else{
    _.each(_.keys(self),function(itemName){
      if (_.isObject(self[itemName]))
        items.push(self[itemName]);
    })
  }
  return items;
}
var fieldInstance2= function(field, value, type, isRoot){
  var self=this;
  _.extend(self, field);

  self.isField=true;
  self.savedValue= value;

  reactiveProp(self, 'value', value);
  reactiveProp(self, 'error', '');
  reactiveProp(self, 'isValid', true);

  self.path=isRoot ? '': type.name;
}

//autorun is valid on value changed?
fieldInstance2.prototype.validate= function(){
  var err={};
  var result= dType.core.getFieldType(this.fieldType).validate(this.value, this, err);
  this.error=err.message;
  this.isValid=result;
  return result;
}

var relation2= function(field, value, type){
  var self=this;
  _.extend(self, field);

  self.isRelation=true;
  self.savedValue= value;

  reactiveProp(self, 'value', value);
  reactiveProp(self, 'error', '');
  reactiveProp(self, 'isValid', true);
}

var addToFieldGroup2= function(fieldGroups, fieldGroupName, item){
  var fieldGroup=fieldGroupName || 'defaultGroup';

  if (! fieldGroups[fieldGroup])
    fieldGroups[fieldGroup]={};

  fieldGroups[fieldGroup][item.name]=item;
}


dType.objTypeInstance= function(ObjTypeName, options){
    var objType=dType.core.getObjType(ObjTypeName);
    var model={};

    model.name=ObjTypeName;
    model.fieldGroups=[];
    _.each(objType.fields, function(field){
        addToFieldGroup(model.fieldGroups, field.fieldGroup, new fieldInstance(field));
    })
    var visibilities= dType.core.getRelationsVisivilityOnType(objType);
    _.each(visibilities, function(v){
        addToFieldGroup(model.fieldGroups, v.fieldGroup, new relation(v));
    })
    if (objType.parent){
        var child=model;
        model=dType.objTypeInstance(objType.parent);
        if(! model.subTypes){
            model.subTypes=[];
        }
        model.subTypes.push(child);
    }
    if(options)
        applyOptions(model, options);

    return model;
}
var applyOptions= function(model, options){
    var keys= _.keys(options);
    _.each(model.subTypes, function(subType){
        if(_.contains(keys, subType.name)){
            applyOptions(subType,options[subType.name])
        }
    })

    _.each(model.fieldGroups,function(group){
        _.each(group.items, function(item){
            if(_.contains(keys, item.name)){
                makeReadOnly(item, options[item.name])
            }
        });
    });
}
var makeReadOnly= function(item, value){
    item._value=value;
    item.editable=false;
}

var addToFieldGroup= function(fieldGroups, fieldGroupName, item){
    var fieldGroup=fieldGroupName || 'defaultGroup';

    if (!_.findWhere(fieldGroups,{fieldGroupName: fieldGroup}))
        fieldGroups.push({fieldGroupName: fieldGroup, items: []});

    _.findWhere(fieldGroups,{fieldGroupName: fieldGroup}).items.push(item)
}

var build= function(fieldGroups, object){
    var obj=object || {};
    _.each(fieldGroups, function(fieldGroup){
        _.each(fieldGroup.items, function(item){
            obj[item.name]=item.value;
        })
    });

    return obj
}
dType.buildAddModel= function(addModel){
    var obj= {
        objNameArray:[]
    };

    _.each(addModel.subTypes, function(subType){
        obj[subType.name]= build(subType.fieldGroups);
        obj.objNameArray.push(subType.name)
    })

    build(addModel.fieldGroups, obj)
    obj.objNameArray.push(addModel.name)
    return obj
}

var fieldInstance= function(field){
    var item= _.clone(field);

    reactiveProp(item, 'value', field.defaultValue);
    reactiveProp(item, 'error', '');
    reactiveProp(item, 'isValid', true);

    item.type='field';
    item.editable=true;
    return item
}
var relation= function(relation){
    var rel= _.clone(relation);
    rel.type= 'relation';

    reactiveProp(rel, 'value', relation.defaultValue);
    reactiveProp(rel, 'error', '');
    reactiveProp(rel, 'isValid', true);
    rel.editable=true;

    return rel;
}

dType.isValid= function(model){
    return _.every(model.fieldGroups,function(group){
        return _.every(group.items, function(field){
            if(field.type=='relation'){
                return dType.isValidRelation(field);
            }
            if(field.type=='field'){
                return dType.isValidField(field);
            }
        });
    }) && _.every(model.subTypes, function(type){
        return dType.isValid(type);
    })
}

dType.isValidRelation= function(rel){
    if (rel.required && !! rel.value){
        relation.error='this field is required';
        options.isValid=false;
        return false
    }
    rel.isValid=true;
    return true;
}
dType.isValidField= function(options){
    var error={};
    var result= dType.core.getFieldType(options.fieldType).validate(options.value, options, error);
//    debugger;
    options.error=error.message;
    options.isValid=result;
    return result
}



dType.displayAllMessages=function(model){
    _.each(model.fieldGroups,function(group){
        _.each(group.items, function(field){
            if(field.type=='relation'){
                dType.isValidRelation(field);
            }
            if(field.type=='field'){
                dType.isValidField(field);
            }
        });
    })
    _.each(model.subTypes, function(type){
        return dType.displayAllMessages(type);
    })
}

var reactiveProp= function(object, key, value){
    var depName='_dep'+ key
    var valueName='_'+ key
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
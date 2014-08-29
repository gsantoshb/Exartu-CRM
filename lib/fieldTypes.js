dType.core.createFieldType({
    name: 'lookUp',
    validate: function(value, fieldDefinition, error){
        error=error||{};

        if (value===null){
            if (fieldDefinition.required)
              error.message='this field is required'
            return ! fieldDefinition.required
        }
        var lookUp=LookUps.findOne({ codeType: fieldDefinition.lookUpCode, _id: value });
        if(! lookUp){
            error.message='Please choose one of the options'
            return false;
        }
        return true;
    },
    defaultValue: function(fieldDefinition, obj, doc){
      debugger;
      if (! doc || ! doc.hierId){
        return null
      }else{
        var lookUp = LookUps.findOne({codeType: fieldDefinition.lookUpCode, isDefault: true, hierId: doc.hierId});
        if (lookUp){
          return lookUp._id;
        }
        return null;
      }
    },
    clientDefaultValue: function(fieldDefinition){
      var lookUp = LookUps.findOne({codeType: fieldDefinition.lookUpCode, isDefault: true});
      if (lookUp){
        return lookUp._id;
      }
      return null;
    }
})
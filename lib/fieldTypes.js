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
    defaultValue: null
})
dType.core.createFieldType({
    name: 'lookUp',
    validate: function(value, fieldDefinition, error){
        error=error||{};

        if (value===null){
            return !! fieldDefinition.required
        }
        var lookUp=LookUps.findOne({ codeType: fieldDefinition.lookUpCode, _id: value });
        if(! lookUp){
            error.message='the value does not exists'
            return false;
        }
        return true;
    },
    defaultValue: null
})
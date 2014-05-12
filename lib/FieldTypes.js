dType.core.createFieldType({
    name: 'lookUp',
    validate: function(value, fieldDefinition){
        var lookUp=LookUps.findOne({ codeType: fieldDefinition.lookUpCode, _id: value });
        return !! lookUp;
    },
    defaultValue: null
})
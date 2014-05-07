// basic FieldTypes
dType.core.createFieldType({
    name: 'string',
    validate: function(value, fieldDefinition){
        if (!_.isString(value))
            return false;

        if(!fieldDefinition.regex)
            return true;

        return new RegExp(fieldDefinition.regex).test(value);
    },
    defaultValue: ''
})
dType.core.createFieldType({
    name: 'number',
    validate: function(value, fieldDefinition){
        if (!_.isNumber(value))
            return false
        if (!fieldDefinition.range){
            return true
        }
        return fieldDefinition.range.min >= value && fieldDefinition.range.min >= value;
    },
    defaultValue: 0
})
dType.core.createFieldType({
    name: 'date',
    validate: function(value, fieldDefinition){
        if (!_.isDate(value))
            return false;
        return true

    },
    defaultValue: new Date()
})
dType.core.createFieldType({
    name: 'enum',
    validate: function(value, fieldDefinition){
        if (!fieldDefinition.options){
            return true
        }
        return _.contains(fieldDefinition.options, value);
    },
    defaultValue: null
})
dType.core.createFieldType({
    name: 'boolean',
    validate: function(value, fieldDefinition){
        return _.isBoolean(value)
    },
    defaultValue: true
})
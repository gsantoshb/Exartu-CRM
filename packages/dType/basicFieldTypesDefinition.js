// basic FieldTypes
dType.core.createFieldType({
    name: 'string',
    validate: function(value, fieldDefinition, error){
        var error=error||{};
        if (fieldDefinition.required && !value){
            error.message='this field is required';
            return false;
        }
        if (!_.isString(value)){
            return false;
        }
        if(!fieldDefinition.regex){
            return true;
        }
        if (! new RegExp(fieldDefinition.regex).test(value)){
            error.message='Check this value';
            return false;
        }
        return true;
    },
    defaultValue: ''
})
dType.core.createFieldType({
    name: 'number',
    validate: function(value, fieldDefinition, error){
        var error=error||{};
        if (fieldDefinition.required && !value){
            error.message='this field is required';
            return false;
        }
        if (!_.isNumber(value)){
            error.message='invalid value';
            return false
        }
        if (!fieldDefinition.range){
            return true
        }
        if(!fieldDefinition.range.min >= value && fieldDefinition.range.min >= value){
            error.message='value out of range';
            return false
        };
        return true
    },
    defaultValue: 0
})
dType.core.createFieldType({
    name: 'date',
    validate: function(value, fieldDefinition, error){
        var error=error||{};
        if (fieldDefinition.required && !value){
            error.message='this field is required';
            return false;
        }
        if (!_.isDate(value)){
            error.message='invalid value';
            return false;
        }
        return true

    },
    defaultValue: new Date()
})
dType.core.createFieldType({
    name: 'enum',
    validate: function(value, fieldDefinition, error){
        var error=error||{};
        if (fieldDefinition.required && !value){
            error.message='this field is required';
            return false;
        }
        if (!fieldDefinition.options){
            return true
        }
        if(_.contains(fieldDefinition.options, value)){
            error.message='invalid value';
            return false;
        }
        return true;
    },
    defaultValue: null
})
dType.core.createFieldType({
    name: 'boolean',
    validate: function(value, fieldDefinition, error){
        var error=error||{};
        if (fieldDefinition.required && !value){
            error.message='this field is required';
            return false;
        }
        if(!_.isBoolean(value)){
            error.message='invalid value';
            return false;
        }
        return true;
    },
    defaultValue: true
})
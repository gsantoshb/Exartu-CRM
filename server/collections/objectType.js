ObjectTypes = [
 EmployeeType,
];

validateContactable = function (obj, typeId) {
    console.log('validating..');
	var objType = _.findWhere(ObjectTypes, {
        _id: typeId
    });
    if (!objType) {
        console.log('object Type not found');
    }

    // validate contactable

    if (obj.type.indexOf(typeId) < 0) {
        console.log('obj.type incorrect');
        console.dir(obj.type);
        return false;
    }

    if (!obj.person & !obj.organization) {
        console.log('the contactable must be a person or an organization');
        return false
    }
    if (obj.person && (!validatePerson(obj.person))) {
        console.log('invalid person');
        return false;
    }
    if (obj.organization && (!validateOrganization(obj.person))) {
        console.log('invalid Organization');
        return false;
    }

    //check for services
    var v = true;
    console.log('checking services...')
    _.forEach(Services, function (service) {
        var needed = objType.services.indexOf(service) >= 0;
        var used = obj[service] ? true : false;

        if (!((needed && used) || (!needed && !used)))
            console.log(service + '-->  needed: ' + needed + '  used: ' + used);

        v = v && ((needed && used) || (!needed && !used));
    });
    console.log('-------------------------');
    if (!v) {
        return false;
    }
    //check fields
    console.log('checking fields...')
    var typeInfo = obj[objType.name];
    v = true;
    _.forEach(objType.fields, function (field) {
        if (typeInfo[field.name])
        {
            if (!typeInfo[field.name].match(field.regex))
                console.log(field.name + '-->  value: ' + typeInfo[field.name]);
            v = v && (typeInfo[field.name].match(field.regex));
        }
    });
    if (!v) {
        return false;
    }

    return true;
};

validatePerson = function (person) {
    if (!person.firstName)
        return false;
    if (!person.lastName)
        return false;

    return true;
};

validateOrganization = function (org) {
    if (!org.organizationName)
        return false;

    return true;
}

Services = ['messages', 'documents', 'pastJobs', 'tags', 'education', 'task'];

Meteor.startup(function () {
    Meteor.methods({
        getFields: function (id) {
            type = _.findWhere(ObjectTypes, {
                _id: id
            });
            if (type)
                return type.fields;
        },
        getContactableTypes: function () {
            return _.map(ObjectTypes, function (type) {
                return {
                    name: type.name,
                    _id: type._id
                }
            });
        }
    });
});
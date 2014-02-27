koObjectGenerator = function (fields) {
    var p = {};
    _.forEach(fields, function (field) {
        p[field.name] = ko.observable();
        if (field.required)
            p[field.name].extend({
                required: true
            });
        if (field.regex)
            p[field.name].extend({
                pattern: {
                    message: 'invalid',
                    params: field.regex
                }
            });
    })

    _.extend(p, {
        load: function (obj) {
            _.forEach(_.keys(p), function (key) {
                if (obj[key])
                    p[key](obj[key]());
            })
        }
    });

    return p;
};

koPerson = function () {
    return koObjectGenerator(Global.personFields);
};

koOrganization = function () {
    return koObjectGenerator(Global.organizationFields);
};

koJob = function () {
    return koObjectGenerator(Global.jobFields);
};

ko.validation.configure({
    registerExtenders: true, //default is true
    messagesOnModified: true, //default is true
    insertMessages: false, //default is true
    //parseInputAttributes: true, //default is false
    //writeInputAttributes: true, //default is false
    //messageTemplate: null,      //default is null
    //decorateElement: true,      //default is false. Applies the .validationElement CSS class
    grouping: {
        deep: true
    } //default is deep: false, observable: true
});

/*
 * subscribe to user data
 */
Deps.autorun(function () {
    Meteor.subscribe('userData');
});
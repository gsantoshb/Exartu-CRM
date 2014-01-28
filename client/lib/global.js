koPerson = function () {
    var p = {};
    _.forEach(Global.personFields, function (field) {
        p[field.name] = ko.observable(field.defaultValue);
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

    return ko.observable(p);
}

koOrganization = function () {
    var o = {};
    _.forEach(Global.organizationFields, function (field) {
        o[field.name] = ko.observable(field.defaultValue);
        if (field.required)
            o[field.name].extend({
                required: true
            });
        if (field.regex)
            o[field.name].extend({
                pattern: {
                    message: 'invalid',
                    params: field.regex
                }
            });

    })

    return ko.observable(o);
}
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
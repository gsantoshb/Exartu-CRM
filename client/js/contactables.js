ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
});

var contactablesHandle = Meteor.subscribe('contactables');

Template.contactables.entities = function () {
    var f = getFilter();
    var q = {
        $or: []
    };
    if (f.isEmployee) {
        q.$or.push({
            isEmployee: true
        });
    }
    if (f.isContact) {
        q.$or.push({
            isContact: true
        });
    }
    if (f.isCustomer) {
        q.$or.push({
            isCustomer: true
        });
    }
    if (q.$or.length == 0) {
        q = {};
    }
    return Contactables.find(q);
};

var getFilter = function () {
    if (Session.equals("filter", undefined)) {
        return {
            isEmployee: true,
            isContact: true,
            isCustomer: true,
        }
    }
    return Session.get("filter")
}
Template.contactables.loading = function () {
    return !contactablesHandle.ready();
};

Template.contactables.events({
    'change #filter-customer': function (event, template) {
        var f = getFilter();
        f.isCustomer = event.currentTarget.checked;
        Session.set('filter', f);
    },
    'change #filter-contact': function (event, template) {
        var f = getFilter();
        f.isContact = event.currentTarget.checked;
        Session.set('filter', f);
    },
    'change #filter-employee': function (event, template) {
        var f = getFilter();
        f.isEmployee = event.currentTarget.checked;
        Session.set('filter', f);
    },
});
Session.set('isChecked', false);
Template.contactables.asd = function () {
    return Session.get('isChecked') ? 'checked' : '';
};
Template.contactables.text = function () {
    return Session.get('isChecked');
};
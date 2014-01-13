//Template.addContactableModal.events({
//    'click #addContactable': function (event, template) {
//        var newContactable = {
//            isEmployee: $('#is-employee').is(':checked'),
//            isContact: $('#is-contact').is(':checked'),
//            isCustomer: $('#is-customer').is(':checked'),
//            statusNote: $('#status-note').val(),
//        }
//        if (!newContactable.isContact && !newContactable.isCustomer && !newContactable.isEmployee) reuturn;
//
//        if (newContactable.isContact || newContactable.isEmployee) {
//            newContactable.firstName = $('#first-name').val();
//            newContactable.lastName = $('#last-name').val();
//        }
//        if (newContactable.isCustomer) {
//            newContactable.organizationName = $('#org-name').val();
//            newContactable.department = $('#dep-name').val();
//        }
//        Meteor.call('addContactable', newContactable);
//        $('#addContactableModal').modal('hide');
//    },
//    'click #is-customer': function (event, template) {
//        if ($('#is-customer').is(':checked')) {
//            $('#customer-info').show();
//        } else {
//            $('#customer-info').hide();
//        }
//    },
//    'click #is-contact': function (event, template) {
//        if ($('#is-contact').is(':checked')) {
//            $('#person-info').show();
//        } else {
//            if (!$('#is-employee').is(':checked')) {
//                $('#person-info').hide();
//            }
//        }
//    },
//    'click #is-employee': function (event, template) {
//        if ($('#is-employee').is(':checked')) {
//            $('#person-info').show();
//        } else {
//            if (!$('#is-contact').is(':checked')) {
//                $('#person-info').hide();
//            }
//        }
//    },
//});
Meteor.methods({
    addContactable: function (contactable) {
        Contactables.insert(contactable);
    }
});
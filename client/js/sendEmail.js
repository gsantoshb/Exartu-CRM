  Template.sendEmailModal.events({
    'click #sendEmail' : function (e,template) {
        var email={
        to: $('#email-to').val(),
        from: $('#email-from').val(),
        subject: $('#email-subject').val()
        };

        Meteor.call("sendEmail",email, function(err)
            {
              if (err) console.log(err);
            });
        $('#sendEmailModal').modal('hide');
    }
});
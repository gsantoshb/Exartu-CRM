  Template.sendmail.events({
    'click #sendEmail' : function (e,tmplate) {
        var email={
        to: $('#email-to').val(),
        from: $('#email-from').val(),
        subject: $('#email-subject').val()
        };

        Meteor.call("sendEmail",email, function(err)
            {
              if (err) console.log(err);
            });
        $('#sendEmail').modal('hide');
    }
});
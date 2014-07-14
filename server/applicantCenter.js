//todo hack
var applicantCenterURL='http://localhost:3030/'

Meteor.methods({
  'sendInvitation':function(employeeId, email){
    console.log('sending invitation..')
    var employee= Contactables.findOne({ _id: employeeId }, {
      transform: function(e){
        _.each(e.contactMethods, function(cm){
          var cmType=ContactMethods.findOne({_id: cm.type});
          cm.typeEnum= cmType && cmType.type;
        })
        return e
      }
    });
    if (! employee){
      throw new Meteor.Error(500,'employee not found')
    }

    if (employee.user){
      throw new Meteor.Error(400,'employee already registered')
    }

    if (!email){
      var contactMethod=_.findWhere(employee.contactMethods,{typeEnum: Enums.contactMethodTypes.email})
      email= contactMethod ? contactMethod.value: false;
    }

    if (! helper.emailRE.test(email)){
      throw new Meteor.Error(500,'invalid email')
    }

    var token= KeyToken.createToken(employee.hierId, {employee: employeeId});

    var html='<h2>You have been invited to join ours ApplicantCenter</h2>' +
      '<a href="' + applicantCenterURL + 'register/' + employee.hierId + '/' + token + '">join</a>'

    if (employee.invitation){
      KeyToken.invalidate(employee.invitation);
    }

    Meteor.call('sendEmail', email ,'TempWorks - Invitation', html, true, function(err, result){
      if(!err){
        //setEmployee as invited
        Contactables.update({ _id: employeeId}, { $set: { invitation: token } });
      }else{
        console.err('error sending invitation email')
        console.dir(err)
      }
    });

  }
})
//todo hack
var applicantCenterURL = process.env.HRCENTER_URL || 'http://localhost:3030/';

HRConcourseManager = {
  sendInvitation: function(employeeId, email){
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

    var html='<h2>Welcome to ApplicantCenter</h2>' +
      '<a href="' + applicantCenterURL + 'register/' + employee.hierId + '/' + token + '">Join</a>'

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

  },
  createContactableFromUser: function(userId){
    //todo: validate appCenter server

    var user = Meteor.users.findOne(userId);
    if (!user){
      throw new Meteor.Error(400, 'User not found')
    }

    return Contactables.insert({
      objNameArray:['person', 'Employee', 'Contactable'],
      hierId: user.hierId,
      userId: user._id,
      user: user._id,
      person: {
        "firstName" : user.username,
        "lastName" : user.username
      },
      Employee:{

      }
    })
  }
};

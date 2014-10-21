Activities = new Meteor.Collection("activities" , {
  transform: function (act) {
    var u =     Meteor.users.findOne({_id : act.userId});

    act.userName = "";
    if (u)
    {
      if (u.emails && u.emails.length>0) act.userName=u.emails[0].address;
    }
    return act;
  }
});
/**
 * Created by ramiro on 21/05/15.
 */
Migrations.add({
  version: 29,
  up: function () {
    var hierArray = Hierarchies.find({hiersContact:{$exists:true}}).fetch();
    _.each(hierArray, function(hier){
      var newHierArray = [];
      var error = false;
      _.each(hier.hiersContact, function(hierId){
         try {
           var h = Hierarchies.findOne({_id: hierId});
           var user = Meteor.users.findOne({_id: h.users[0]});
           var email = user && user.emails[0].address;
           var contactable = Contactables.findOne({"contactMethods":{$elemMatch:{value:email}}})
           if(contactable){
             newHierArray.push({hier:hierId,contactable:contactable._id});
           }
         }
         catch(e){console.log("failed, hier:", h);
                  console.log("user:",user);
                  console.log("email:", email);
                  console.log("contactable", contactable);
                  error = true;}
      })
      if(!error)
        Hierarchies.update({_id:hier._id},{$set:{hiersContact:newHierArray}});
    });
    console.log('Finished migration 29');
  }
});

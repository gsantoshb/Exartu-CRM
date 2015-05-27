/**
 * Created by ramiro on 20/05/15.
 */
Migrations.add({
  version: 27,
  up: function () {
    Meteor.users.update({tours: {$exists: false}},{$set:{tours:[{tour:"tourActivities",tip:27}]}}, {multi:true});
    console.log('Finished migration 27');
  }
});

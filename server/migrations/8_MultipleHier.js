Migrations.add({
  version: 8,
  up: function () {
    if (Meteor.users.find({ hierarchies: { $exists: false } }).count()){
      console.log('Adding hierarchies array to old users')
      Meteor.users.find({ hierarchies: { $exists: false } }).forEach(function(doc){
        Meteor.users.update({ _id: doc._id }, { $set: { hierarchies: [doc.hierId], currentHierId: doc.hierId } });
      })
    }
  }
});
Migrations.add({
  version: 21,
  up: function() {
    dType.ObjTypes.remove({ name: 'Customer' });
    Contactables.find({Customer:{$exists:true}}).forEach(function(c){
      c.objNameArray = _.map(c.objNameArray, function(a){
        if(a === "Customer"){
          return "Client";
        }
        else{
          return a;
        }
      });
      try {
        Contactables.update({_id: c._id}, {
          $set: {
            Client:
              c.Customer
            , objNameArray: c.objNameArray
          }
        });
      }
      catch(e){
        console.log('exploto la migracion en:',c);
      }
      Contactables.update({_id: c._id},{$unset:{Customer:""}} )
    });

  }
});
Meteor.methods({
    addUserToTenant: function(id,hierId) {
        TenantManager.addUserToTenant(id,hierId);
    },
    removeUserFromTenant: function(id,hierId) {
        TenantManager.removeUserFromTenant(id,hierId);
    },
    //isAidaHier: Meteor.wrapAsync(function(hier, cb){
    //  cb(null, hier === ExartuConfig.aidaHierarchy);
    //})
    getAidaHierId: function(){
      return ExartuConfig.aidaHierarchy;
    },
    getAidaHiersContact: function(){
      var Hier = Hierarchies.findOne({_id:ExartuConfig.aidaHierarchy});
      if(Hier.hiersContact){
        var hierArray =  Hier.hiersContact;
        hierArray.push(ExartuConfig.aidaHierarchy);
        return hierArray;
      }
      else{
        return [ExartuConfig.aidaHierarchy];
      }
    },
    setHiersContact: function(hierId){
      var Hier = Hierarchies.findOne({_id:ExartuConfig.aidaHierarchy});
      if(Hier.hiersContact){
         Hier.hiersContact.push(hierId);
         Hierarchies.update({_id:ExartuConfig.aidaHierarchy},{ $set: {
           'hiersContact': Hier.hiersContact
         }})
      }
      else{
        Hierarchies.update({_id:ExartuConfig.aidaHierarchy},{ $set: {
          'hiersContact': [hierId]
        }})
      }
    }
});

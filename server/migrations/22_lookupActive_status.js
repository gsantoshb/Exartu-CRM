Migrations.add({
  version: 22,
  up: function() {
     LookUps.update({lookUpCode: Enums.lookUpCodes.active_status, displayName:"Inactive" }, {$set:{lookUpActions: [Enums.lookUpAction.Implies_Inactive]}}, {multi:true});
  }
});
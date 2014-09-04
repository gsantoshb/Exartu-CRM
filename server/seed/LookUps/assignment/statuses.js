_.forEach([
  {
    displayName: 'Assigned', lookUpActions:[Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Placement_Assigned]
  },
  {
    displayName: 'Candidate', lookUpActions:[Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Placement_Candidate],isDefault: true
  },
    {
      displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive]
    }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.placement.status.lookUpCode;
    systemLookUps.push(item);
  }
);
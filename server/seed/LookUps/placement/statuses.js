_.forEach([
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active],isDefault: true
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Deleted',lookUpActions:[Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Deleted]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.placement.status.lookUpCode;
    systemLookUps.push(item);
  }
);
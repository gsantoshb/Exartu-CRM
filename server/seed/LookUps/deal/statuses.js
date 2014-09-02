_.forEach([
  {
    displayName: 'Won', lookUpActions:[Enums.lookUpAction.Won,Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Lost',lookUpActions:[Enums.lookUpAction.Lost,Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active],isDefault: true
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.deal.status.lookUpCode;
    systemLookUps.push(item);
  }
);
_.forEach([
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active]
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
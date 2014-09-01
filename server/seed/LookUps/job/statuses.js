_.forEach([
  {
    displayName: 'Inactive',lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Unfilled',lookUpActions:[Enums.lookUpAction.Implies_Active],isDefault: true
  },
  {
    displayName: 'Filled',lookUpActions:[Enums.lookUpAction.Implies_Active]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.job.status.lookUpCode;
    systemLookUps.push(item);
  }
);
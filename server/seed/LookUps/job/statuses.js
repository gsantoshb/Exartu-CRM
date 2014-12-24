_.forEach([
  {
    displayName: 'Inactive',lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  },
  {
    displayName: 'Deleted',lookUpActions:[Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Deleted]
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
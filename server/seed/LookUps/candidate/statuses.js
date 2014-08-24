_.forEach([
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Submittal',lookUpActions:[Enums.lookUpAction.Submittal,Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Sendout', lookUpActions:[Enums.lookUpAction.Sendout,Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Placed', lookUpActions:[Enums.lookUpAction.Placed,Enums.lookUpAction.Implies_Active],isDefault: true
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive],isDefault: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.candidate.status.code;
    systemLookUps.push(item);
  }
);
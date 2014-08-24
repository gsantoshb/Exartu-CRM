_.forEach([
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive],isDefault: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.assignment.status.code;
    systemLookUps.push(item);
  }
);
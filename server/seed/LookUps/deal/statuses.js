_.forEach([
  {
    displayName: 'Won', lookupActions:[Enums.lookUpActions.implied_status.inactive,Enums.lookUpActions.deal_status.won]
  },
  {
    displayName: 'Lost',lookupActions:['inactive']
  },
  {
    displayName: 'Inactive', lookupActions:['inactive']
  },
  {
    displayName: 'Active', lookupActions:['active'],isDefault: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.deal.status.code;
    systemLookUps.push(item);
  }
);
_.forEach([
  {
    displayName: 'Won', lookupActions:['inactive','won']
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
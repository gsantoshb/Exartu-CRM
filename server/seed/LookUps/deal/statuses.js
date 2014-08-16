_.forEach([
  {
    displayName: 'Won', lookUpActions:[Enums.lookUpTypes.deal.status.Won]
  },
  {
    displayName: 'Lost',lookUpActions:[Enums.lookUpTypes.deal.status.Won]
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpTypes.deal.status.Won]
  },
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpTypes.deal.status.Won],isDefault: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.deal.status.code;
    systemLookUps.push(item);
  }
);
_.forEach([
  {
    displayName: 'One-Time', lookUpActions:[''],isDefault: true,sortOrder:10
  },
  {
    displayName: 'Weekly', lookUpActions:['recurring'],sortOrder:20
  },
  {
    displayName: 'Monthly', lookUpActions:['recurring'],sortOrder:30
  },

  {
    displayName: 'Quarterly', lookUpActions:['recurring'],sortOrder:40
   },

  {
    displayName: 'Yearly', lookUpActions:['recurring'],sortOrder:50
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.deal.dealRevenueFrequency.lookUpCode;
    systemLookUps.push(item);
  }
);
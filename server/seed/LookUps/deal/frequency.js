_.forEach([
  {
    displayName: 'One-Time', lookUpActions:[''],isDefault: true
  },
  {
    displayName: 'Weekly', lookUpActions:['recurring']
  },
  {
    displayName: 'Monthly', lookUpActions:['recurring']
  },

  {
    displayName: 'Quarterly', lookUpActions:['recurring']
   },

  {
    displayName: 'Yearly', lookUpActions:['recurring']
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.deal.dealRevenueFrequency.lookUpCode;
    systemLookUps.push(item);
  }
);
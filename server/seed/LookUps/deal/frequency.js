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
    item.codeType = Enums.lookUpTypes.deal.dealRevenueFrequency.code;
    systemLookUps.push(item);
  }
);
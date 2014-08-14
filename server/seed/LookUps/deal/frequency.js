_.forEach([
  {
    displayName: 'One-Time', lookupActions:[''],isDefault: true
  },
  {
    displayName: 'Weekly', lookupActions:['recurring']
  },
  {
    displayName: 'Monthly', lookupActions:['recurring']
  },

  {
    displayName: 'Quarterly', lookupActions:['recurring']
   },

  {
    displayName: 'Yearly', lookupActions:['recurring']
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.deal.dealRevenueFrequency.code;
    systemLookUps.push(item);
  }
);
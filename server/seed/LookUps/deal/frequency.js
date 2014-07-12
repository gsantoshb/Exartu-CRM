_.forEach([
  {
    displayName: 'One-Time', recurring: false,isDefault: true
  },
  {
    displayName: 'Weekly', recurring: true
  },
  {
    displayName: 'Monthly', recurring: true
  },

  {
            displayName: 'Quarterly', recurring: true
   },

  {
    displayName: 'Yearly', recurring: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.deal.dealRevenueFrequency.code;
    systemLookUps.push(item);
  }
);
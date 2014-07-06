_.forEach([
  {
    displayName: 'One-Time', recurring: false
  },
  {
    displayName: 'Weekly', recurring: true
  },
  {
    displayName: 'Monthly', recurring: true
  },
  {
    displayName: 'Yearly', recurring: true
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.deal.revenueFrequency.code;
    systemLookUps.push(item);
  }
);
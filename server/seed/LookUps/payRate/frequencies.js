_.forEach([
  {
    displayName: 'Hourly',
    inHours: 1
  },
  {
    displayName: 'Daily',
    inHours: 8
  },
  {
    displayName: 'Weekly',
    inHours: 40
  },
  {
    displayName: 'Monthly',
    inHours: 120
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.payRate.frequencies.lookUpCode;
    systemLookUps.push(item);
  }
);

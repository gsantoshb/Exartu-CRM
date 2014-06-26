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
    item.codeType = Enums.lookUpTypes.payRate.frequencies.code;
    systemLookUps.push(item);
  }
);

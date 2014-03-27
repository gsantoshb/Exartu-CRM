_.forEach([
  {
    displayName: 'hour',
    inHours: 1
  },
  {
    displayName: 'day',
    inHours: 8
  },
  {
    displayName: 'week',
    inHours: 40
  },
  {
    displayName: 'month',
    inHours: 120
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.payRate.frequencies.code;
    systemLookUps.push(item);
  }
);

_.forEach([
  {
    displayName: 'Open',
  },
  {
    displayName: 'Close',
  },
  {
    displayName: 'Unfilled',
  },
  {
    displayName: 'Filled',
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.status.code;
    systemLookUps.push(item);
  }
);
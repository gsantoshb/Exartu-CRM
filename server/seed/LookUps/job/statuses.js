_.forEach([
  {
    displayName: 'Open',
    code: 0
  },
  {
    displayName: 'Close',
    code: 1
  },
  {
    displayName: 'Unfilled',
    code: 2
  },
  {
    displayName: 'Filled',
    code: 3
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.status.code;
    systemLookUps.push(item);
  }
);
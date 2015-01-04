_.forEach([

  {
    displayName: 'Unfilled',isDefault: true
  },
  {
    displayName: 'Filled'
  },
      {
        displayName: 'Lost'
      }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.job.status.lookUpCode;
    systemLookUps.push(item);
  }
);
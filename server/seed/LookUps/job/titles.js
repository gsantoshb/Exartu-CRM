_.forEach([
  {
    displayName: 'Developer'
  },
  {
    displayName: 'Designer'
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.job.titles.lookUpCode;
    systemLookUps.push(item);
  }
);
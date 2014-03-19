_.forEach([
  {
    displayName: 'Developer',
  },
  {
    displayName: 'Designer',
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.titles.code;
    systemLookUps.push(item);
  }
);
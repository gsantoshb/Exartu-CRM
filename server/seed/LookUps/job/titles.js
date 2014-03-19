_.forEach([
  {
    displayName: 'Developer',
    code: 0
  },
  {
    displayName: 'Designer',
    code: 1
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.titles.code;
    systemLookUps.push(item);
  }
);
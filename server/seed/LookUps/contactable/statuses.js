_.forEach([
  {
    displayName: 'Invited',
    weigth: 2,
    code: 0
  },
  {
    displayName: 'Recruited',
    weigth: 3,
    code: 1,
    dependencies: [0]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.contactable.status.code;
    systemLookUps.push(item);
  }
);
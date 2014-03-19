_.forEach([
  {
    displayName: 'Invited',
    weigth: 2,
  },
  {
    displayName: 'Recruited',
    weigth: 3,
    dependencies: [0]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.contactable.status.code;
    systemLookUps.push(item);
  }
);
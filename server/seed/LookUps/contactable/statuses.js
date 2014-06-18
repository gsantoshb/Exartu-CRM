_.forEach([
  {
    displayName: 'Invited',
    weight: 2,
  },
  {
    displayName: 'Recruited',
    weight: 3,
    dependencies: [0]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.contactable.status.code;
    systemLookUps.push(item);
  }
);

//employee status
_.forEach([
  {
    displayName: 'One'
  },
  {
    displayName: 'Two'
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.employee.recruiterStatus.code;
    systemLookUps.push(item);
  }
);
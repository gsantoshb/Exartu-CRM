_.forEach([
  {
    displayName: 'Invited',lookUpActions:[Enums.lookUpAction.Implies_Active],
    weight: 2
  },
  {
    displayName: 'Recruited',lookUpActions:[Enums.lookUpAction.Implies_Active],
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
    displayName: "Active",lookUpActions:[Enums.lookUpAction.Implies_Active],
    isDefault: true
  },
  {
    displayName: "Inactive",lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  }

],
  function (item) {
    item.codeType = Enums.lookUpTypes.employee.recruiterStatus.code;
    systemLookUps.push(item);
  }
);
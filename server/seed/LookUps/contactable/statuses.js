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
    item.lookUpCode = Enums.lookUpTypes.contactable.status.lookUpCode;
    systemLookUps.push(item);
  }
);

//employee status
_.forEach([

  {
    displayName: "Active",lookUpActions: [Enums.lookUpAction.Implies_Active],
    isDefault: true
  },
  {
    displayName: "Inactive",lookUpActions: [Enums.lookUpAction.Implies_Inactive]
  }

],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.employee.status.lookUpCode;
    systemLookUps.push(item);
  }
);
//customer status
_.forEach([

  {
    displayName: "Active",lookUpActions: [Enums.lookUpAction.Implies_Active],
    isDefault: true
  },
  {
    displayName: "Inactive",lookUpActions: [Enums.lookUpAction.Implies_Inactive]
  }

],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.customer.status.lookUpCode;
    systemLookUps.push(item);
  }
);
//contact status
_.forEach([

  {
    displayName: "Active",lookUpActions: [Enums.lookUpAction.Implies_Active],
    isDefault: true
  },
  {
    displayName: "Inactive",lookUpActions: [Enums.lookUpAction.Implies_Inactive]
  }

],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.contact.status.lookUpCode;
    systemLookUps.push(item);
  }
);
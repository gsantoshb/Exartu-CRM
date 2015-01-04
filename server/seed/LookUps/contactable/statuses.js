_.forEach([
  {
    displayName: 'Active',lookUpActions:[Enums.lookUpAction.Implies_Active],
    weight: 2
  },
  {
    displayName: 'Inactive',lookUpActions:[Enums.lookUpAction.Implies_Active],
    weight: 3,
    dependencies: [0]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.active.status.lookUpCode;
    systemLookUps.push(item);
  }
);

//employee status
_.forEach([

  {
    displayName: "Hired",lookUpActions: [],
    isDefault: true
  },
  {
    displayName: "Applicant",lookUpActions: []
  },
      {
        displayName: "Prospect",lookUpActions: []
      },
      {
        displayName: "Other",lookUpActions: []
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
    displayName: "Client",lookUpActions: [],
    isDefault: true
  },

  {
    displayName: "Prospect",lookUpActions: []
  },
  {
    displayName: "Other",lookUpActions: []
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
    displayName: "Prospect",lookUpActions: []
  },
  {
    displayName: "Client",lookUpActions: [],
    isDefault: true
  },
      {
        displayName: "Other",lookUpActions: []
      }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.contact.status.lookUpCode;
    systemLookUps.push(item);
  }
);
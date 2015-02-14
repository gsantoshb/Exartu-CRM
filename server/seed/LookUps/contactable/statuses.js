_.forEach([
        {
            displayName: 'Active', lookUpActions: [Enums.lookUpAction.Implies_Active],sortOrder:10,
            isDefault: true,
            weight: 2
        },
        {
            displayName: 'Inactive', lookUpActions: [Enums.lookUpAction.Implies_Active],sortOrder:20,
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
            displayName: "Lead", lookUpActions: [],sortOrder:10
        },
        {
            displayName: "Applicant", lookUpActions: [],sortOrder:20
        },
        {
            displayName: "Candidate", lookUpActions: [],sortOrder:30
        },
        {
            displayName: "Hired", lookUpActions: [],
            isDefault: true,sortOrder:40
        },


        {
            displayName: "Other", lookUpActions: [],sortOrder:40
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
            displayName: "Lead", lookUpActions: [],
            isDefault: true,sortOrder:10
        },


        {
            displayName: "Contacted", lookUpActions: [],sortOrder:20
        },
        {
            displayName: "Qualified", lookUpActions: [],sortOrder:30
        },
        {
            displayName: "Client", lookUpActions: [],sortOrder:40
        },
        {
            displayName: "Other", lookUpActions: [],sortOrder:50
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.customer.status.lookUpCode;
        systemLookUps.push(item);
    }
);

_.forEach([
        {
            displayName: "Lead", lookUpActions: [],
            isDefault: true,sortOrder:10
        },


        {
            displayName: "Contacted", lookUpActions: [],sortOrder:10
        },
        {
            displayName: "Qualified", lookUpActions: [],sortOrder:20
        },
        {
            displayName: "Client", lookUpActions: [],sortOrder:30
        },
        {
            displayName: "Other", lookUpActions: [],sortOrder:40
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.contact.status.lookUpCode;
        systemLookUps.push(item);
    }
);

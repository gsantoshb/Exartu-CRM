_.forEach([
        {
            displayName: 'Active', lookUpActions: [Enums.lookUpAction.Implies_Active],sortOrder:10,
            isDefault: true,
            weight: 2
        },
        {
            displayName: 'Inactive', lookUpActions: [Enums.lookUpAction.Implies_Inactive],sortOrder:20,
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
//client status
_.forEach([
        {
            displayName: "Lost", lookUpActions: [Enums.lookUpAction.Client_Lost], sortOrder:-20
        },
        {
            displayName: "Prospect", lookUpActions: [],
            isDefault: true,sortOrder:-10
        },


        {
            displayName: "Talked  With", lookUpActions: [],sortOrder:20
        },
        {
            displayName: "Needs Analysis", lookUpActions: [],sortOrder:30
        },
        {
            displayName: "Proposal", lookUpActions: [],sortOrder:40
        },
        {
            displayName: "Negotiation", lookUpActions: [],sortOrder:50
        }
        ,
        {
            displayName: "Won", lookUpActions: [Enums.lookUpAction.Client_Won],sortOrder:60
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.client.status.lookUpCode;
        systemLookUps.push(item);
    }
);

_.forEach([
        {
            displayName: "Rate issue", lookUpActions: [],sortOrder:-1
        },
        {
            displayName: "Location issue", lookUpActions: [],sortOrder:-1
        },


        {
            displayName: "Slow service", lookUpActions: [],sortOrder:-1
        },
        {
            displayName: "Contract terms", lookUpActions: [],sortOrder:-1
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.client.lostReason.lookUpCode
        systemLookUps.push(item);
    }
);



_.forEach([
        {
            displayName: "Lead", lookUpActions: [],
            isDefault: true,sortOrder:10
        },


        {
            displayName: "Contacted", lookUpActions: [],sortOrder:15
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

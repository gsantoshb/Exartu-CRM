_.forEach([
        {
            displayName: 'Qualification', lookUpActions: [], isDefault: true,sortOrder:10
        },
        {
            displayName: 'Decision Process', lookUpActions: [],sortOrder:20
        },
        {
            displayName: 'Presentation', lookUpActions: [],sortOrder:30
        },
        {
            displayName: 'Negotiation', lookUpActions: [],sortOrder:40
        },
        {
            displayName: 'Won', lookUpActions: [],sortOrder:50
        },
        {
            displayName: 'Lost', lookUpActions: [],sortOrder:50
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.deal.status.lookUpCode;
        systemLookUps.push(item);
    }
);
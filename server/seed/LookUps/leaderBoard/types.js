_.forEach([
        {
            displayName: 'Sales Activity', lookUpActions: [Enums.lookUpAction.LeaderBoardType_Activity]
        },
        {
            displayName: 'Contacts Acquired', lookUpActions: [Enums.lookUpAction.LeaderBoardType_Contacts]
        },
        {
            displayName: 'Deal Pipeline', lookUpActions: [Enums.lookUpAction.LeaderBoardType_DealPipeline]
        },
        {
            displayName: 'Loss Report', lookUpActions: [Enums.lookUpAction.LeaderBoardType_LossReport]
        }
    ],
    function (item) {
        item.lookUpCode = Enums.lookUpTypes.leaderBoard.type.lookUpCode;
        systemLookUps.push(item);
    }
);
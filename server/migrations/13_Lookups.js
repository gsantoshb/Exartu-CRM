Migrations.add({
    version: 13,
    up: function () {
        var hierarchiesId = Hierarchies.find().map(function (hier) { return hier._id; });

        _.forEach(hierarchiesId, function (hierId) {
            if (LookUps.find({lookUpCode:Enums.lookUpTypes.howHeardOf.type.lookUpCode,hierId:hierId}).count()==0)
            _.forEach([
                    {
                        displayName: 'Referral', lookUpActions:[Enums.lookUpAction.HowHeardOf_Referral]
                    },
                    {
                        displayName: 'Internet',lookUpActions:[Enums.lookUpAction.HowHeardOf_Internet]
                    },
                    {
                        displayName: 'Other', lookUpActions:[Enums.lookUpAction.HowHeardOf_Other]
                    }
                ],
                function (item) {
                    item.lookUpCode = Enums.lookUpTypes.howHeardOf.type.lookUpCode;
                    item.hierId = hierId;
                    LookUps.insert(item);
                    console.log('lkp inserted',item);
                }
            );
            if (LookUps.find({lookUpCode:Enums.lookUpTypes.leaderBoard.type.lookUpCode,hierId:hierId}).count()==0)
                _.forEach([
                        {
                            displayName: 'Sales Activity', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Activity]
                        },
                        {
                            displayName: 'Contacts Acquired',lookUpActions:[Enums.lookUpAction.LeaderBoardType_Contacts]
                        },
                        {
                            displayName: 'Deal Pipeline', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Pipeline]
                        }
                    ],
                    function (item) {
                        item.lookUpCode = Enums.lookUpTypes.leaderBoard.type.lookUpCode;
                        item.hierId = hierId;
                        LookUps.insert(item);
                        console.log('lkp inserted',item);
                    }
                );

        });
    }
});

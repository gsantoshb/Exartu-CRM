Migrations.add({
    version: 15,
    up: function () {
        var hierarchiesId = Hierarchies.find().map(function (hier) { return hier._id; });

        _.forEach(hierarchiesId, function (hierId) {
            if (LookUps.find({lookUpCode:Enums.lookUpTypes.customer.lostReason.lookUpCode.type,hierId:hierId}).count()==0)
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
                    item.lookUpCode = Enums.lookUpTypes.customer.lostReason.lookUpCode
                    item.hierId = hierId;
                    LookUps.insert(item);
                    console.log('lkp inserted',item);
                }
            );
        });
    }
});

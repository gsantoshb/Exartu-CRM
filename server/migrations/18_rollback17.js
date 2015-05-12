//Search for all tags and add them to the collection tags
Migrations.add({
    version: 18,
    up: function() {
        var contactableCursor = Contactables.find({addresses: {$exists: true, $ne: []}});

        if (contactableCursor.count()){
            console.log('removing addresses to ' + contactableCursor.count() + ' contactables');
        }

        var affected = 0;

        contactableCursor.forEach(function (contactable) {
            console.log('migrating ' + contactable._id + ', which has ' + contactable.addresses.length + ' addresses');
            contactable.addresses.forEach(function (address) {
                if (! Addresses.findOne(address._id, {fields:{_id:1}}))
                    Addresses.insert(address);
            });
            console.log('deleting addresses array');
            Contactables.update({_id: contactable._id}, {$unset: {addresses: ''}});
            ++affected;
        });

        if (affected){
            console.log(affected + ' addresses moved to collection');
        }

        Contactables.update({addresses: []},  {$unset: {addresses: ''}});
    }

});
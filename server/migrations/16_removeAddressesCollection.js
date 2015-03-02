//Search for all tags and add them to the collection tags
Migrations.add({
    version: 16,
    up: function() {
        var affected = Contactables.update({addresses: {$exists: false}},{$set: {addresses: []}}, {multi: true});

        if (affected){
            console.log('added addresses to ' + affected + ' contactables');
        }

        affected = 0;

        Addresses.find({}).forEach(function (address) {
            Contactables.update({_id: address.linkId}, {$push: {addresses: address}});
            Addresses.remove({_id: address._id});
            ++affected;
        });

        if (affected){
            console.log(affected + ' addresses moved to contactable');
        }
    }

});
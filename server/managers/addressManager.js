AddressManager = {
    addEditAddress: function (addr) {
        // Validation
        if (!addr) {
            throw new Error('Address information is required');
        }
        console.log('addr', addr);
        if (addr._id){
            
            Contactables.update({
                _id: addr.linkId,
                'addresses._id': addr._id
            }, {
                $set: {
                 'addresses.$': addr
                }
            });

        } else {
            console.log('insert');

            addr._id = Meteor.uuid();
            Contactables.update({
                _id: addr.linkId
            },{
                $push: {
                    addresses: addr
                }
            });
        }

    },
    removeAddress: function (id) {
        if (!id){
            throw new Error('id is required');
        }
        Contactables.update({ 'addresses._id': id }, { $pull: { addresses: { _id: id } } });
    },
    getAddress: function (contactableid, addresstype) {
        var contactable = Contactables.findOne({linkId: contactableid}); // ignore type check for now
        return contactable.addresses.length ? contactable.addresses[0] : undefined;
    }

};


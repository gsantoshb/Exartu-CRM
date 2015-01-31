AddressManager = {
    addEditAddress: function (addr) {
        // Validation
        if (!addr) {
            throw new Error('Address information is required');
        }
        if (addr._id)         Addresses.update({_id: addr._id},addr);
        else Addresses.insert(addr);

    },
    removeAddress: function (id) {
        Addresses.remove({_id: id});
    }

};


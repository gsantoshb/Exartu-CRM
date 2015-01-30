AddressManager = {
    addEditAddress: function (addr) {
        // Validation
        if (!addr) {
            throw new Error('Address information is required');
        }
        console.log('addr',JSON.stringify(addr));
        if (addr._id)         Addresses.remove({_id: addr._id});
        Addresses.insert(addr);

    },
    removeAddress: function (id) {
        Addresses.remove({_id: id});
    }

};


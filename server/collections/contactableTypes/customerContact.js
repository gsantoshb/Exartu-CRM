fieldType = {
    string: 0,
    int: 1,
    date: 2,
    select: 3,
    checkbox: 4
};
var isCustomer = {};
isCustomer[CustomerType.name] = {
    $exists: true
}

CustomerContactType = {
    _id: 3,
    name: 'CustomerContact',
    services: ['messages', 'tasks'],
    fields: [{
        name: 'test',
        regex: /./,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: true
    }, {
        name: 'test2',
        regex: /./,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: true
    }],
    relations: [{
        name: 'customer',
        target: {
            collection: 'Contactables',
            query: isCustomer,
        },
        cardinality: {
            min: 0,
            max: 1
        },
        defaultValue: null,
        validate: function (value) {
            return (v.type) && (v.type.indexOf[CustomerContactType._id] >= 0);
        },
        showInAdd: true,
    }]
}
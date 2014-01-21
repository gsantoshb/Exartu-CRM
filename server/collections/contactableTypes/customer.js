fieldType = {
    string: 0,
    int: 1,
    date: 2,
    select: 3,
    checkbox: 4
};
var isContact = {};
isContact['CustomerContact'] = {
    $exists: true
}

CustomerType = {
    _id: 1,
    name: 'Customer',
    services: ['messages', 'tasks'],
    fields: [{
        name: 'department',
        regex: /./,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: true,
    }, {
        name: 'test2',
        regex: /./,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: false,
    }],
    relations: [{
        name: 'contacts',
        target: {
            collection: 'Contactables',
            query: isContact
        },
        cardinality: {
            min: 0,
            max: Infinity
        },
        defaultValue: [],
        validate: function (value) {
            if (Object.prototype.toString.call(value) === '[object Array]') {
                var r = true;
                _.forEach(value, function (v) {
                    r = r && (v.type.indexOf[CustomerContactType._id] >= 0);
                })
                return r;
            } else {
                return (v.type.indexOf[CustomerContactType._id] >= 0);
            }
        },
        showInAdd: false,
    }]
}
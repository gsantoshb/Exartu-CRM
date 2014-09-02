var newRelation = dType.constructor.relation;
newRelation({
    name: 'CustomerContacts',
    obj1: 'Contact',
    obj2: 'Customer',
    visibilityOn1: {
        name: 'customer',
        displayName: 'Customer',
        collection: 'Contactables',
        cardinality: {
            min: 0,
            max: 1
        }
    }
});

newRelation({
    name: 'CustomerJobs',
    obj1: 'job',
    obj2: 'Customer',
    visibilityOn1: {
        name: 'customer',
        displayName: 'Customer',
        collection: 'Contactables',
        cardinality: {
            min: 1,
            max: 1
        }
    }
});
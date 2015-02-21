var newRelation = dType.constructor.relation;
newRelation({
    name: 'ClientContacts',
    obj1: 'Contact',
    obj2: 'Client',
    visibilityOn1: {
        name: 'client',
        displayName: 'Client',
        collection: 'Contactables',
        cardinality: {
            min: 0,
            max: 1
        }
    }
});

newRelation({
    name: 'ClientJobs',
    obj1: 'job',
    obj2: 'Client',
    visibilityOn1: {
        name: 'client',
        displayName: 'Client',
        collection: 'Contactables',
        cardinality: {
            min: 1,
            max: 1
        }
    }
});
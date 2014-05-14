
var newRelation=dType.constructor.relation;
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
    },
    visibilityOn2: {
       name: 'contacts',
       displayName: 'Contacts',
       collection: 'Contactables',
       cardinality: {
           min: 0,
           max: Infinity
       }
    }
});

newRelation({
    name: 'CustomerJobs',
    obj1: 'Customer',
    obj2: 'job',
    visibilityOn1: {
       name: 'jobs',
       displayName: 'Jobs',
       collection: 'Jobs',
       cardinality: {
           min: 0,
           max: Infinity
       }
    },
    visibilityOn2: {
       name: 'customer',
       displayName: 'Customer',
       collection: 'Contactables',
       cardinality: {
           min: 1,
           max: 1
       }
    }
});
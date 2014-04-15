Tinytest.add('dType - simple Test', function(test){
    var contactablesCollection= new Meteor.Collection('test.contactable');
    var jobCollection= new Meteor.Collection('test.job');
    jobCollection.remove({});

    var newObjType=dType.constructor.objType;
    var newRelation=dType.constructor.relation;
    newObjType({
        name: 'contactable',
        fields:[{
            name: 'name',
            regex: '.+'
        }],
        collection: contactablesCollection
    })
    newObjType({
        name: 'employee',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        parent: 'contactable'
    })
    newObjType({
        name: 'customer',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        parent: 'contactable'
    })
    newObjType({
        name: 'job',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        collection: jobCollection
    })

    newRelation({
        name: 'CustomerJobs',
        obj1: 'job',
        obj2: 'customer',
        visibilityOn1: {
            name: 'customer',
            cardinality: {
                min: 1,
                max: 1
            }
        },
        visibilityOn2: {
            name: 'jobs',
            cardinality: {
                min: 0,
                max: Infinity
            }
        }
    });
    newRelation({
        name: 'assignment',
        obj1: 'employee',
        obj2: 'job',
        visibilityOn1: {
            name: 'assigned',
            cardinality: {
                min: 0,
                max: 1
            }
        },
        visibilityOn2: {
            name: 'assigned',
            cardinality: {
                min: 0,
                max: 1
            }
        }
    });

    console.log('******************************************+++');
    //job without name
    jobCollection.insert({
        objNameArray: ['job'],
        name: ''
    })
    test.equal(jobCollection.find().count(), 0,'a job without name was inserted');

    console.log('******************************************+++');
    //job without customer
    jobCollection.insert({
        objNameArray: ['job'],
        name: 'noCustomer',
        customer: null
    })
    test.equal(jobCollection.find().count(), 0,'a job without customer was inserted');


    //insert a customer
    var costumerID=contactablesCollection.insert({
        objNameArray: 'contactable',
        name:'contactableName',
        customer:{
            name:'customerName'
        }
    })
    test.equal(contactablesCollection.find().count(), 1,'the customer was NOT inserted');

    //insert a job with a bad customer
    jobCollection.insert({
        objNameArray: ['job'],
        name: 'noCustomer',
        customer: 'badCustomer'
    })
    test.equal(jobCollection.find().count(), 0,'a job with a bad customer was inserted');

    //insert a job
    jobCollection.insert({
        objNameArray: ['job'],
        name: 'noCustomer',
        customer: costumerID
    })
    test.equal(jobCollection.find().count(), 1,'a job was NOT inserted');

})
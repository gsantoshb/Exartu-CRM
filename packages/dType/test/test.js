Tinytest.add('dType - simple Test', function(test){
    var contactablesCollection= new Meteor.Collection(null);
    var jobCollection= new Meteor.Collection(null);
    jobCollection.remove({});
    contactablesCollection.remove({});
    var newObjType=dType.constructor.objType;
    var newRelation=dType.constructor.relation;
    console.log('Contactable...');
    newObjType({
        name: 'contactable',
        fields:[],
        collection: contactablesCollection
    })
    console.log('employee...');
    newObjType({
        name: 'employee',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        parent: 'contactable'
    })
    console.log('customer...');
    newObjType({
        name: 'customer',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        parent: 'contactable'
    })
    console.log('job...');
    newObjType({
        name: 'job',
        fields:[{
            name: 'name',
            displayName: 'Name',
            regex: '.+'
        }],
        collection: jobCollection
    })
    console.log('Contactable...');

    newRelation({
        name: 'CustomerJobs',
        obj1: 'job',
        obj2: 'customer',
        visibilityOn1: {
            name: 'customer',
            collection: contactablesCollection,
            cardinality: {
                min: 1,
                max: 1
            }
        },
        visibilityOn2: {
            name: 'jobs',
            collection: jobCollection,
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
            collection: jobCollection,
            cardinality: {
                min: 0,
                max: 1
            }
        },
        visibilityOn2: {
            name: 'assigned',
            collection: contactablesCollection,
            cardinality: {
                min: 0,
                max: 1
            }
        }
    });

    console.log('******************************************');
    //job without name
    jobCollection.insert({
        objNameArray: ['job'],
        name: ''
    })
    test.equal(jobCollection.find().count(), 0,'a job without name was inserted');

//    console.log('******************************************');
    //job without customer
    jobCollection.insert({
        objNameArray: ['job'],
        name: 'noCustomer',
        customer: null
    })
    test.equal(jobCollection.find().count(), 0,'a job without customer was inserted');

    console.log('******************************************');
    //insert a customer
    var customerId=contactablesCollection.insert({
        objNameArray: ['customer'],
        name:'contactableName',
        customer:{
            name:'customerName',
            jobs: []
        }
    })
    console.log(customerId)
    test.equal(contactablesCollection.find().count(), 1,'the customer was NOT inserted');
    console.log('******************************************');
    //insert a job with a bad customer
    jobCollection.insert({
        objNameArray: ['job'],
        name: 'noCustomer',
        customer: 'badCustomer'
    })
    test.equal(jobCollection.find().count(), 0,'a job with a bad customer was inserted');
    console.log('******************************************');
    //insert a job
//    console.log(customerId);
    var jobID=jobCollection.insert({
        objNameArray: ['job'],
        name: 'one job',
        customer: customerId
    })
    test.equal(jobCollection.find().count(), 1,'a job was NOT inserted');


    console.log('******************************************');
    //check that the customer is updated
    var customer=contactablesCollection.findOne({_id: customerId});
//    console.dir(customer)
    test.equal(customer.customer.jobs,[jobID],'customer\'s job');


})
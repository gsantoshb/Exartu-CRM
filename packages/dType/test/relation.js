Tinytest.add('dType - relation Test', function(test){
  var contactablesCollection= new Meteor.Collection(null);
  var newObjType=dType.constructor.objType;
  var newRelation=dType.constructor.relation;
  console.log('\n******************************************************\n');
  console.log('Contactable...');
  newObjType({
    name: 'contactable',
    fields:[],
    collection: contactablesCollection
  })
  console.log('contact...');
  newObjType({
    name: 'contact',
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

  console.log('relation...');
  newRelation({
    name: 'CustomerContacts',
    obj1: 'contact',
    obj2: 'customer',
    visibilityOn1: {
      name: 'customer',
      collection: contactablesCollection,
      cardinality: {
        min: 0,
        max: 1
      }
    },
    visibilityOn2: {
      name: 'contacts',
      collection: contactablesCollection,
      cardinality: {
        min: 0,
        max: Infinity
      }
    }
  });

  var customerId= contactablesCollection.insert({
    objNameArray: ['customer', 'contactable'],
    customer:{
      name: 'customer',
      contacts: []
    }
  })

  var contactId= contactablesCollection.insert({
    objNameArray: ['contact', 'contactable'],
    contact:{
      name: 'contact1',
      customer: null
    }
  })

  contactablesCollection.update({_id: contactId}, {$set: { 'contact.customer': customerId }});
  var customer=contactablesCollection.findOne({_id: customerId});
  console.dir(customer.customer.contacts);

  test.equal(customer.customer.contacts, [contactId],'customer not updated');

  var customer2Id= contactablesCollection.insert({
    objNameArray: ['customer', 'contactable'],
    customer:{
      name: 'customer2',
      contacts: []
    }
  })
  contactablesCollection.update({_id: contactId}, {$set: { 'contact.customer': customer2Id }});

  var customer2=contactablesCollection.findOne({_id: customer2Id});
  console.dir(customer2.customer.contacts);

  test.equal(customer2.customer.contacts, [contactId],'customer2 not updated');

  var customer=contactablesCollection.findOne({_id: customerId});
  console.dir(customer.customer.contacts);

  test.equal(customer.customer.contacts, [],'customer not updated 2º time');


});

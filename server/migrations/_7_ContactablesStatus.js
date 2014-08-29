Migrations.add({
  version: 7,
  up: function() {
    console.log('updating employees');
    Contactables.find({$or: [{
      'Employee.status': {$exists: false}
    },{
      'Employee.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({codeType: Enums.lookUpTypes.employee.status.code, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating employee ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.update(doc._id,{ $set: { 'Employee.status': lookUp._id } });
      }
    })

    console.log('updating contacts');
    Contactables.find({$or: [{
      'Contact.status': {$exists: false}
    },{
      'Contact.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({codeType: Enums.lookUpTypes.contact.status.code, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating contact ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.update(doc._id,{ $set: { 'Contact.status': lookUp._id } });
      }
    })

    console.log('updating customers');
    Contactables.find({$or: [{
      'Customer.status': {$exists: false}
    },{
      'Customer.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({codeType: Enums.lookUpTypes.customer.status.code, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating customer ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.update(doc._id,{ $set: { 'Customer.status': lookUp._id } });
      }
    })

  }
});
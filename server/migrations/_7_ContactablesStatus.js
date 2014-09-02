Migrations.add({
  version: 7,
  up: function() {
    console.log('updating employees');
    Contactables.find({
      Employee:{$exists: true},
      $or: [{
      'Employee.status': {$exists: false}
    },{
      'Employee.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating employee ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.direct.update({_id: doc._id},{ $set: { 'Employee.status': lookUp._id } }, {});
      }
    })

    console.log('updating contacts');
    Contactables.find({
      Contact:{$exists: true},
      $or: [{
      'Contact.status': {$exists: false}
    },{
      'Contact.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating contact ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.direct.update({_id: doc._id},{ $set: { 'Contact.status': lookUp._id } }, {});
      }
    })

    console.log('updating customers');
    Contactables.find({
      Customer:{$exists: true},
      $or: [{
      'Customer.status': {$exists: false}
    },{
      'Customer.status': null
    }]}).forEach(function(doc, index, cursor){
      var lookUp = LookUps.findOne({lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode, isDefault: true, hierId: doc.hierId});
      if (lookUp){
        console.log('updating customer ' + doc._id + ' with status ' + lookUp._id);
        return Contactables.direct.update({_id: doc._id},{ $set: { 'Customer.status': lookUp._id } }, {});
      }
    })

  }
});
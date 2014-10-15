PlacemetList = new View('placementList', {
  collection: Placements,
  mapping: {
    jobInfo: {
      find: function(placement) {
        return Jobs.find({_id: placement.job });
      },
      map: function (job) {
        //todo: helper to get display name of contactables in server side?
        if (!job) return;
        var customer = Contactables.findOne(job.customer);
        var customerName = customer.organization ? customer.organization.organizationName: '';
        return {
            jobDisplayName: job.publicJobTitle,
            customerDisplayName: customerName,
            customer: job.customer,
            displayName: job.publicJobTitle + '@' + customerName
        };
      }
    },
    employeeInfo: {
      find: function(placement) {
        return Contactables.find({_id: placement.employee });
      },
      map: function (employee) {
        if (!employee || ! employee.person) return;
        return {
          employeeDisplayName: employee.person.firstName + employee.person.lastName
        };
      }
    }
  }

});



Meteor.publish('placements', function () {
  PlacemetList.publishCursor(PlacemetList.find(), this, 'placements');
});

Meteor.startup(function () {
  Meteor.methods({
    addPlacement: function (placement) {
      return Placements.insert(placement);
    }
  })
});

Placements.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Placements.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

Placements.after.insert(function(userId, doc){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            placement: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            placement: doc._id
        }
    });
});

Placements.after.update(function(userId, doc){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        placement: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        placement: doc._id
      }
    });
  }

});

ContactablesView = new Mongo.Collection('contactablesView');

Meteor.paginatedPublish(ContactablesView, function () {
        if (!this.userId)
            return [];
        return Utils.filterCollectionByUserHier.call(this, ContactablesView.find({},
                {
                    fields: {
                        // Only fields displayed on list
                    },
                    sort: {
                        dateCreated: -1
                    }
                })
        );
    },
    {
        pageSize: 20,
        publicationName: 'contactablesView',
        updateSelector: function (oldSelector, clientParams) {
            var newSelector = EJSON.clone(oldSelector);
            if (clientParams && clientParams.placementStatus) {
                // Get ids of employees that have placements with status equal to clientParams.placementStatus
                newSelector._id = {
                    $in: Placements.find({candidateStatus: {$in: clientParams.placementStatus}}).map(function (placement) {
                        return placement.employee;
                    })
                };
            }

            // Address location filter
            if (clientParams && clientParams.location) {
              // Get the ids of contactables (linkId) that have addresses that matches the criteria
              if (_.isString(clientParams.location)) {
                // Search the text in the most common properties
                newSelector._id = {
                  $in: Addresses.find({$or: [
                    {address: {$regex: clientParams.location, $options: 'i'}},
                    {city: {$regex: clientParams.location, $options: 'i'}},
                    {state: {$regex: clientParams.location, $options: 'i'}},
                    {country: {$regex: clientParams.location, $options: 'i'}}
                  ]}).map(function (address) {
                    return address.linkId;
                  })
                };

              } else {
                // Search as specified
                var query = {$and: []};
                if (clientParams.location.address)
                  query.$and.push({address: {$regex: clientParams.location.address, $options: 'i'}});
                if (clientParams.location.city)
                  query.$and.push({city: {$regex: clientParams.location.city, $options: 'i'}});
                if (clientParams.location.state)
                  query.$and.push({state: {$regex: clientParams.location.state, $options: 'i'}});
                if (clientParams.location.country)
                  query.$and.push({country: {$regex: clientParams.location.country, $options: 'i'}});

                // Check that the AND contains at least 1 element
                if (query.$and.length > 0) {
                  if (query.$and.length == 1) {
                    query = query.$and[0];
                  }

                  newSelector._id = {
                    $in: Addresses.find(query).map(function (address) {
                      return address.linkId;
                    })
                  };
                }
              }
            }

            return newSelector;
        }
    }
);



/// hooks
Contactables.after.insert(function (userId, contactable) {

  // extract what the contactable list needs
  // this fields are all present when inserting a contactable (tags is only present in API posts)
  var view = _.pick(contactable,'_id','userId', 'hierId', 'dateCreated', 'contactMethods', 'activeStatus', 'tags');

  // display name
  if (contactable.person){
    view.person = true;
    view.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + (contactable.person.middleName ? (' ' + contactable.person.middleName): '');
  }else if (contactable.organization){
    view.organization = true;
    view.displayName = contactable.organization.organizationName;
  }

  // contacts
  if (contactable.Contact) {
    view.Contact = true;
    if (contactable.Contact.client){
      view.client = contactable.Contact.client;
      var client = Contactables.findOne(contactable.Contact.client, {fields: {'organization.organizationName': 1}});
      view.clientName = client.organization.organizationName;
    }
    view.contactStatus = contactable.Contact.status;
  }

  // clients
  if (contactable.Client) {
    view.Client = true;
    view.clientStatus = contactable.Client.status;
    view.department = contactable.Client.department;
  }

  // employees
  if (contactable.Employee) {
    view.Employee = true;
    view.employeeStatus = contactable.Employee.status;
    view.taxID = contactable.Employee.taxID;
  }

  ContactablesView.insert(view);
});
Contactables.after.update(function (userId, contactable, fieldNames, modifier, options) {

  var update = {};
  var viewSet = {};

  _.each(_.intersection(fieldNames,['userId','activeStatus']), function (key) {
    viewSet[key] = contactable[key];
  });
  if (modifier.$set){
    var setModifier = modifier.$set;

    // display name
    if (setModifier['person.lastName'] || setModifier['person.firstName'] || setModifier['person.middleName']){
      viewSet.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + (contactable.person.middleName ? (' ' + contactable.person.middleName): '');
    }else if (setModifier['organization.organizationName']){
      viewSet.displayName = contactable.organization.organizationName;

      // update contacts
      ContactablesView.update({client: contactable._id}, {$set: {clientName: viewSet.displayName}}, {multi: true});
    }

    // contacts
    if (_.contains(fieldNames,'Contact')) {
      if (setModifier['Contact.client']) {
        viewSet.client = contactable.Contact.client;
        var client = Contactables.findOne(contactable.Contact.client, {fields: {'organization.organizationName': 1}});
        viewSet.clientName = client.organization.organizationName;
      }
      if (setModifier['Contact.status']) {
        viewSet.contactStatus = contactable.Contact.status;
      }
    }

    // clients
    if (_.contains(fieldNames,'Client')) {
      if (setModifier['Client.status']) {
        viewSet.clientStatus = contactable.Client.status;
      }
      if (setModifier['Client.department']) {
        viewSet.department = contactable.Client.department;
      }
    }

    // employees
    if (_.contains(fieldNames,'Employee')) {
      if (setModifier['Employee.status']) {
        viewSet.employeeStatus = contactable.Employee.status;
      }
      if (setModifier['Employee.taxID']) {
        viewSet.taxID = contactable.Employee.taxID;
      }
    }
  }

  // placement
  if (_.contains(fieldNames,'placement')){
    var placement = Placements.findOne(contactable.placement, {fields: {'candidateStatus': 1, job: 1}});
    var job = Jobs.findOne(placement.job, {fields: {'publicJobTitle': 1, 'clientDisplayName': 1, 'client': 1}});
    viewSet.placement = _.pick(placement, 'candidateStatus');
    viewSet.placement.jobDisplayName = job.publicJobTitle;
    viewSet.placement.clientDisplayName = job.clientDisplayName;
    viewSet.placement.job = job._id;
    viewSet.placement.client = job.client;
  }

  // tags
  if (_.contains(fieldNames,'tags')) {
    if (modifier.$addToSet) {
      update.$addToSet = modifier.$addToSet;
    } else if (modifier.$pull) {
      update.$pull = modifier.$pull;
    }
  }

  // contactMethods
  if (_.contains(fieldNames,'contactMethods')) {
    if (modifier.$addToSet) {
      update.$addToSet = modifier.$addToSet;
    } else if (modifier.$pull) {
      update.$pull = modifier.$pull;
    }
  }
  if (!_.isEmpty(viewSet)){
    update.$set = viewSet;
  }

  if (!_.isEmpty(update)) {
    ContactablesView.update({_id: contactable._id}, update);
  }
});

//notes
Notes.after.insert(function (userId, note) {
  _.each(note.links, function (link) {
    if (link.type == Enums.linkTypes.contactable.value){
      ContactablesView.update(link.id, {
        $set: {
          lastNote:{
            userId: note.userId,
            msg: note.msg,
            dateCreated: note.dateCreated
          }
        }
      });
    }
  })
});
Notes.after.update(function (userId, note, fieldNames, modifier) {
  // todo: check if links are edited

  if (modifier.$set && modifier.$set.msg){
    _.each(note.links, function (link) {
      if (link.type == Enums.linkTypes.contactable.value){
        ContactablesView.update(link.id, {
          $set: {
            'lastNote.msg': note.msg
          }
        });
      }
    })
  }
});

//addresses
Addresses.after.insert(function (userId, address) {
  if (Contactables.findOne(address.linkId, {fields:{_id:1}})){
      ContactablesView.update(address.linkId, {
        $push: {
          addresses: address
        }
      });
  }
});
Addresses.after.update(function (userId, address, fieldNames, modifier) {
  if (Contactables.findOne(address.linkId, {fields:{_id:1}})){
    ContactablesView.update({ _id: address.linkId, addresses: { $elemMatch: {_id: address._id } } }, {
      $set: {
        'addresses.$': address
      }
    });
  }
});


// Indexes

ContactablesView._ensureIndex({hierId: 1});
ContactablesView._ensureIndex({'dateCreated': 1});
ContactablesView._ensureIndex({objNameArray: 1});
ContactablesView._ensureIndex({'Employee.status': 1});
ContactablesView._ensureIndex({'Client.status': 1});
ContactablesView._ensureIndex({'Contact.status': 1});
ContactablesView._ensureIndex({'activeStatus': 1});
ContactablesView._ensureIndex({userId: 1});

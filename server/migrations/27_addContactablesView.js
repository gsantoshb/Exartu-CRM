
Migrations.add({
  version: 27,
  up: function () {
    var cursor = Contactables.find({});

    var count = cursor.count();
    if (count) {
      console.log(' creating views for ' + count + ' contactables');
      count = 0;

      cursor.forEach(function (contactable) {
        if (ContactablesView.findOne({_id: contactable._id}, {_id:1})){
          return;
        }

        count++;
        console.log('creating view for contactable (' + contactable._id + ') - count=' + count);


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



        // placement
        if (contactable.placement){
          var placement = Placements.findOne(contactable.placement, {fields: {'candidateStatus': 1, job: 1}});
          var job = Jobs.findOne(placement.job, {fields: {'publicJobTitle': 1, 'clientDisplayName': 1, 'client': 1}});
          view.placement = _.pick(placement, 'candidateStatus');
          view.placement.jobDisplayName = job.publicJobTitle;
          view.placement.clientDisplayName = job.clientDisplayName;
          view.placement.job = job._id;
          view.placement.client = job.client;
        }

        //lastNote
        if (contactable.latestNotes && contactable.latestNotes.length){
          var lastNote = contactable.latestNotes[contactable.latestNotes.length-1];
          view.lastNote = {
            userId: lastNote.userId,
            msg: lastNote.msg,
            dateCreated: lastNote.dateCreated
          }
        }

        //addresses
        view.addresses = Addresses.find({linkId: contactable._id}).fetch();

        ContactablesView.insert(view);
      });
    }

    console.log('Finished migration 27, ' + count + ' views created');
  }
});

var getUrl = function (apiKey) {
  var datacenter = apiKey.split('-')[1];
  return 'https://' + datacenter + '.api.mailchimp.com/2.0/';
};

var OkString = 'Everything\'s Chimpy!';

MailChimpManager = {
  saveConfiguration: Meteor.wrapAsync(function (apikey, hierId, cb) {
    if (MailChimpManager.ping(apikey)){
      Hierarchies.update(hierId, {$set: {mailchimp: {apiKey: apikey}}});
      cb(null,null);
    }else{
      cb(new Error('invalid token'))
    }
  }),
  getLists: Meteor.wrapAsync(function (hierId, cb) {
    var hier = Hierarchies.findOne(hierId);
    if (!hier || ! hier.mailchimp){
      cb(new Error('Hierarchy not configured'));
    }
    var apiKey = hier.mailchimp.apiKey;

    var url = getUrl(apiKey) + 'lists/list';

    HTTP.post(url,{ data: { apikey: apiKey } }, function (err, result) {
      if (err){
        cb(err)
      }
      cb(null, result.data.data)

    });
  }),
  getSubscribers: Meteor.wrapAsync(function (hierId, listId, cb) {
    var hier = Hierarchies.findOne(hierId);
    if (!hier || ! hier.mailchimp){
      cb(new Error('Hierarchy not configured'));
    }
    if (!listId){
      cb(new Error('missing listId'));
    }

    var apiKey = hier.mailchimp.apiKey;

    var url = getUrl(apiKey) + 'lists/members';

    HTTP.post(url,{ data: { apikey: apiKey, id: listId } }, function (err, result) {
      if (err){
        cb(err)
      }
      cb(null, result.data.data)

    });
  }),
  importContacts: Meteor.wrapAsync(function (hierId, listId, hotListId, cb) {

    var members = MailChimpManager.getSubscribers(hierId, listId);

    var emailCMType = LookUpManager.ContactMethodTypes_Email();

    var contactsToAdd = []; // contacts that should be added to the hotList

    var imported = [], failed = [], existed = [];

    _.each(members, function (member) {
      try{

        if (!member.merges){
          throw new Error('failed to import contact (names missing)', member.email);
        }


        var contact = {
          objNameArray: ['contactable', 'person', 'Contact'],
          person: {

          },
          Contact: {},
          mailChimpId: member.id
        };


        if (!member.merges.FNAME || !member.merges.LNAME){

          // check if email exists
          var old = Contactables.findOne({
            hierId: hierId,
            'contactMethods': {$elemMatch:{value: member.email}}
          }, {fields: {_id: 1}});
          if (old){
            existed.push(member.id);
            contactsToAdd.push(old._id);
            return;
          }

          // use what I can as firstName and lastName
          var emailName = member.email.split('@')[0];
          var nameParts = emailName.split('.');
          contact.person.firstName = nameParts[0];

          contact.person.lastName = nameParts[1] || ' ';
        }else {

          contact.person.firstName = member.merges.FNAME;
          contact.person.lastName = member.merges.LNAME;

          //check if already exists
          var oldContacts = Contactables.find({
            hierId: hierId,
            'person.firstName': contact.person.firstName,
            'person.lastName': contact.person.lastName
          }, {fields: {contactMethods: 1}}).fetch();


          if (oldContacts.length) {
            // check also the email
            var old = _.find(oldContacts, function (oldcontact) {
              return _.findWhere(oldcontact.contactMethods, {value: member.email});
            });
            if (old) {
              existed.push(member.id);
              contactsToAdd.push(old._id);
              return;
            }
          }
        }

        var contactId = ContactableManager.create(contact);
        if (!Contactables.findOne(contactId)) {
          throw new Error('failed to import contact', member.email);
        }

        ContactableManager.addContactMethod(contactId, emailCMType._id, member.email);

        contactsToAdd.push(contactId);

        imported.push(member.id);

      } catch (e) {
        console.log(e);
        failed.push(member.id);
      }

    });

    if (hotListId && contactsToAdd.length){
      HotListManager.addToHotlist(hotListId, contactsToAdd)
    }
    cb(null, {
      imported: imported,
      failed: failed,
      existed: existed
    })
  }),
  ping: Meteor.wrapAsync(function (apikey, cb) {
    var url = getUrl(apikey) + 'helper/ping';

    HTTP.post(url,{ data: { apikey: apikey } }, function (err, result) {
      if (err){
        cb(new Error('invalid token'))
      }

      if (result.data.msg != OkString){
        cb(new Error('invalid token'));
      }
      cb(null, true);

    });
  })
};
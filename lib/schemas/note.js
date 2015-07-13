NoteAddEditSchema = new SimpleSchema({
  msg: {
    type: String,
    label: 'Note'
  },
  remindDate: {
    type: Date,
    optional: true,
    label: 'Remind Date'
  }
});


var displayToString = function(){
  var c = Contactables.findOne({_id:Session.get('entityId')});
  if(c) {

    if (c.Employee) {
      return 'Display to employee';
    }
    else if (c.Contact) {
      return 'Display to contact';
    }
    else if (c.Client) {
      return 'Display to client';
    }
  }
};
NoteSchema = new SimpleSchema({
  msg: {
    type: String,
    label: 'Message'
  },
  links: {
    type: [Object],
    label: 'Entities linked'
  },
  'links.$.id': {
    type: String
  },
  'links.$.type': {
    type: Number,
    allowedValues: _.map(Enums.linkTypes, function (type) {
      return type.value;
    })
  },
  sendAsSMS: {
    type: Boolean,
    label: 'Send SMS/Text',
    optional: true
  },
  hotListFirstName: {
    type: Boolean,
    label: 'Preface with first name?',
    optional: true
  },
  userNumber: {
    type: String,
    optional: true,
    label: 'SMS/Text origin number(s)'
  },
  contactableNumber: {
    type: String,
    optional: true,
    label: 'SMS/Text destination number'
  },
  contactableId: {
    type: String,
    label: 'Entity',
    autoValue: function () {
      return Session.get('entityId');
    }
  },
  displayToEmployee: {
    type: Boolean,
    optional: true,
    label: displayToString

  },
  remindDate: {
    type: Date,
    optional: true,
    label: 'Remind Date'
  }
});


ContactableManager = {
  create: function (contactable) {
    return Contactables.insert(contactable);
  },
  createFromResume: function (stream) {
    var result = ResumeManager.parse(stream);
    if (result instanceof Meteor.Error)
      throw result;

    return ContactableManager.create(result);
  },
  createFromPlainResume: function (text) {
    var future = new Future();

    HTTP.post(
      'http://xr2demo.tempworks.com/resumeparser/api/Parser/ParseFromString',
      {
        data: text
      },
      function (error, result) {
        if (error)
          future.throw(error);
        else {
          // Generate a temp Employee to insert
          var tempEmployee = {};
          tempEmployee.objNameArray = ['person', 'Employee', 'contactable'];
          tempEmployee.person = {
            firstName: '',
            middleName: '',
            lastName: ''
          };
          tempEmployee.Employee = {};

          // Parse the result
          var json = EJSON.parse(result.content);
          xml2js.parseString(json, Meteor.bindEnvironment(function (error, result) {
            if (error)
              future.throw(error);
            else {

              // Create new Employee
              extractInformation(result, tempEmployee);
              var employeeId = ContactableManager.create(tempEmployee);
              future.return(employeeId);
            }
          }));
        }
      }
    );

    return future.wait();
  },
  setPicture: function (contactableId, fileId) {
    Contactables.update({
      _id: contactableId
    }, {
      $set: {
        pictureFileId: fileId
      }
    });
  },

  addContactMethod: function (contactableId, type, value) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }
    if (type === undefined) { throw new Error('Contact method type is required'); }
    if (! value) { throw new Error('Contact method value is required'); }
    if (! _.contains(_.toArray(Enums.contactMethodTypes), type)) { throw new Error('Invalid Contact Method Type'); }
    var contactMethodType = ContactMethods.findOne({ type: type });
    if (!contactMethodType) { throw new Error('Invalid contact method type'); }

    // Conctact method insertion
    Contactables.update({ _id: contactableId }, { $addToSet: { contactMethods: { type: contactMethodType._id, value: value} } }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },
  getContactMethods: function (contactableId) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }

    var contactable = Contactables.findOne({ _id: contactableId }, { fields: { contactMethods: 1 } });

    return contactable ? contactable.contactMethods : [];
  },

  setAddress: function (contactableId, addressInfo) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }
    if (! addressInfo) { throw new Error('Address information is required'); }

    // Conctact method insertion
    Contactables.update({ _id: contactableId }, { $set: { location: addressInfo } }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },
  getAddress: function (contactableId) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }

    var contactable = Contactables.findOne({ _id: contactableId }, { fields: { location: 1 } });
    return contactable ? contactable.location : {};
  }
};
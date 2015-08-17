schemaAddPlacement = new SimpleSchema({
  'employee': {
    type: String,
    optional: false
  },
  'candidateStatus':{
    type:String,
    optional:false
  },
  'startDate':{
    type:Date,
    optional:true
  },
  'setStartDate':{
    type:Boolean,
    optional:true
  },
  'endDate':{
    type:Date,
    optional:true
  },
  'setEndDate':{
    type:Boolean,
    optional:true
  },
  'rateQuote':{
    type:String,
    optional:true
  }
});


PlacementAddController = RouteController.extend({
    waitOn: function () {
        return [Meteor.subscribe('allEmployees') , Meteor.subscribe('lookUps')];
    },
    data: function () {
        Session.set('objType', this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('addPlacementPage');
    },
    onAfterAction: function () {
        var title = 'Add ' + Session.get('objType');
        var description = '';

        SEO.set({
            title: title,
            meta: {
                'description': description
            },
            og: {
                'title': title,
                'description': description
            }
        });
    }
});

var model;
var options;
var employeeId;
var sending = new ReactiveVar(false);

//var createPlacement = function (objTypeName) {
//    options = Session.get('addOptions');
//    if (!options) options={};
//    var defaultStatus = LookUps.findOne({lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode, isDefault: true});
//    if (!defaultStatus)   var defaultStatus = LookUps.findOne({lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode});
//    if (defaultStatus) options.candidateStatus = defaultStatus._id;
//    if (options) {
//        Session.set('addOptions', undefined);
//    }
//    model = new dType.objTypeInstance(Session.get('objType'), options);
//    return model
//};

Template.addPlacementPage.helpers({
    candidateStatusOptions: function(){
      var candidateStatusArray = LookUps.find({lookUpCode:Enums.lookUpCodes.candidate_status}).fetch()
      var toReturn = _.map(candidateStatusArray, function(a){
        return {label: a.displayName, value: a._id}
      })
      return toReturn;
    },
    employeeId: function () {
        return employeeId;
    },
    //model: function () {
    //    if (!model) {
    //        model = createPlacement(Session.get('objType'));
    //    }
    //    return model;
    //},
    objTypeName: function () {
        return Session.get('objType');
    },
    getEmployees: function () {
        return {getCollection: function (string) {
            var self = this;
            if (_.isEmpty(string)) {
                // Get last five client used
                Meteor.call('getLastUsed', Enums.lastUsedType.employee, function (err, result) {
                    if (err)
                        return console.log(err);

                    self.ready(_.map(result, function (employee) {
                                                  Utils.extendContactableDisplayName(employee);
                            return {id: employee._id, text: employee.displayName};
                        })
                    );
                });
            } else {
                var employees = [];
                var stringWord = _.compact(string.replace(",", "").split(" "));
                var searchFields = ['person.firstName', 'person.lastName', 'person.middleName'];
                var query = {
                    $or: _.map(searchFields, function (field) {
                        var aux = {$or:   _.map(stringWord, function(word){
                          var aux2={};
                          aux2[field] = {
                            $regex: '(.)*' + word + '(.)*',
                            $options: 'i'
                          };
                          return aux2;
                        }) };

                        return aux;
                    })
                };
                var Status = LookUps.findOne({lookUpCode: Enums.lookUpCodes.active_status, lookUpActions: Enums.lookUpAction.Implies_Active});
                AllEmployees.find({$and: [query,{activeStatus: Status._id } ]}, {sort: {'person.lastName': 1}}).forEach(function (doc) {
                    employees.push({id: doc._id, text: doc.displayName});
                });
                self.ready(employees);
            }
        }
       }
    },
    selectEmployee: function () {
        return function (selectedValue) {
            employeeId = selectedValue;
        }
    },
    isSelected: function (id) {
        return employeeId == id;
    },
    disableButton: function () {
        return sending.get();
    },
    'getEmployee': function() {
      return {
        getCollection: function (string) {
          var self = this;

          //todo: calculate method
          Meteor.call('findEmployee', string, function (err, result) {
            if (err)
              return console.log(err);

            self.ready(_.map(result, function (r) {
                var text =  r.person.firstName+', '+r.person.lastName;
                //if (r.Client) text = text + '/' + r.Client.department;
                text = text + '/' + r._id;
                return {id: r._id, text: text};
              })
            );
          });
        }
      }
    },
  'employeeChanged': function() {
    return {
      selectionChanged: function (value) {
        this.value = value;
      }
    }
  }
});

Template.addPlacementPage.events({
    //'click .btn-success': function () {
    //    if (!dType.isValid(model)) {
    //        dType.displayAllMessages(model);
    //        return;
    //    }
    //    var obj = dType.buildAddModel(model);
    //
    //    if (options.job) obj.job = options.job;
    //    obj.employee = employeeId;
    //    sending.set(true);
    //    Meteor.call('getPlacements', obj.job, obj.employee, function(err, res){
    //      if(res.length === 0) {
    //        Meteor.call('isPlacedEmployee', obj.employee, function(err, res){
    //          if(res === true){
    //            Utils.showModal('basicModal', {
    //              title: 'Employee already placed',
    //              message: 'Selected employee already is placed on a job, do you want to continue?',
    //              buttons: [{label: 'Ok',
    //                classes: 'btn-success',
    //                value: true
    //              },{label: 'Cancel',
    //                classes: 'btn-info',
    //                value: false
    //              }],
    //              callback: function (result) {
    //                sending.set(false);
    //                if(result){
    //                  Meteor.call('addPlacement', obj, function (err, result) {
    //                    sending.set(false);
    //                    if (err) {
    //                      console.dir(err);
    //                      alert('Add placement error: ' + err);
    //                    }
    //                    else {
    //                      // add employee to last used employees list
    //                      Meteor.call('setLastUsed', Enums.lastUsedType.employee, obj.employee);
    //                      Router.go('/placement/' + result);
    //                    }
    //                  });
    //                }
    //              }
    //
    //            });
    //          }
    //          else{
    //            Meteor.call('addPlacement', obj, function (err, result) {
    //              sending.set(false);
    //              if (err) {
    //                console.dir(err);
    //                alert('Add placement error: ' + err);
    //              }
    //              else {
    //                // add employee to last used employees list
    //                Meteor.call('setLastUsed', Enums.lastUsedType.employee, obj.employee);
    //                Router.go('/placement/' + result);
    //              }
    //            });
    //          }
    //        })
    //
    //      }
    //      else {
    //        Utils.showModal('basicModal', {
    //          title: 'Existing placement',
    //          message: 'Cannot create placement, selected employee already is placed on this job',
    //          buttons: [{
    //            label: 'Ok',
    //            classes: 'btn-success',
    //            value: true
    //          }],
    //          callback: function (result) {
    //            sending.set(false);
    //          }
    //
    //        });
    //      }
    //        });
    //      //}
    //    //})
    //
    //},
    'click .goBack': function () {
        history.back();
    }
});

Template.addPlacementPage.destroyed = function () {
    model = undefined;
};


AutoForm.hooks({
  addPlacement: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var placement = {};
      placement.objNameArray = ["placement"];
      placement.statusNote = "";
      placement.candidateStatus = insertDoc.candidateStatus;
      if(insertDoc.setStartDate){
        placement.startDate = insertDoc.startDate;
      }
      if(insertDoc.setEndDate){
        placement.endDate = insertDoc.endDate;
      }
      placement.rateQuote = insertDoc.rateQuote;
      var lkActive = LookUps.findOne({lookUpCode:Enums.lookUpCodes.active_status,lookUpActions:Enums.lookUpAction.Implies_Active});
      placement.activeStatus = lkActive._id;
      var addOptions = Session.get('addOptions');
      placement.employee = insertDoc.employee;
      placement.hierId = Meteor.user().currentHierId;
      placement.userId = Meteor.user()._id;
      placement.dateCreated = new Date();

      if(_.isEmpty(addOptions)){
        //throw some error
        console.log("Error, no job selected")
      }
      else{
        placement.job = addOptions.job;
        Meteor.call('getPlacements', placement.job, placement.employee, function(err, res){
              if(res.length === 0) {
                Meteor.call('isPlacedEmployee', placement.employee, function(err, res){
                  if(res === true){
                    Utils.showModal('basicModal', {
                      title: 'Employee already placed',
                      message: 'Selected employee already is placed on a job, do you want to continue?',
                      buttons: [{label: 'Ok',
                        classes: 'btn-success',
                        value: true
                      },{label: 'Cancel',
                        classes: 'btn-info',
                        value: false
                      }],
                      callback: function (result) {
                        sending.set(false);
                        if(result){
                          Meteor.call('addPlacement', placement, function (err, result) {
                            sending.set(false);
                            if (err) {
                              console.dir(err);
                              alert('Add placement error: ' + err);
                            }
                            else {
                              // add employee to last used employees list
                              Meteor.call('setLastUsed', Enums.lastUsedType.employee, placement.employee);
                              Router.go('/placement/' + result);
                            }
                          });
                        }
                      }

                    });
                  }
                  else{
                    Meteor.call('addPlacement', placement, function (err, result) {
                      sending.set(false);
                      if (err) {
                        console.dir(err);
                        alert('Add placement error: ' + err);
                      }
                      else {
                        // add employee to last used employees list
                        Meteor.call('setLastUsed', Enums.lastUsedType.employee, placement.employee);
                        Router.go('/placement/' + result);
                      }
                    });
                  }
                })

              }
              else {
                Utils.showModal('basicModal', {
                  title: 'Existing placement',
                  message: 'Cannot create placement, selected employee already is placed on this job',
                  buttons: [{
                    label: 'Ok',
                    classes: 'btn-success',
                    value: true
                  }],
                  callback: function (result) {
                    sending.set(false);
                  }

                });
              }
                });
              //}
            //})

      }
      return false;
    }
  }
})
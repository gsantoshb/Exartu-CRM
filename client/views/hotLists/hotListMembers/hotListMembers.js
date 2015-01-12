var self = {};

Utils.reactiveProp(self,'editMode',false);

RateSchema = new SimpleSchema({
  type: {
    type: String,
    //allowedValues: LookUps.find({lookUpCode: Enums.lookUpTypes.hotList.rate.lookUpCode}).map(function(rateType){ return rateType._id}),
    autoform: {
      type: "select"
    }
  },
  pay: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    min: 0
  },
  bill: {
    decimal: true,
    type: Number,
    defaultValue: 0,
    min: 0
  }
});

Template.hotListRates.created = function () {
  self.editMode = false;
  self.rates = [];
  loadRates();
};

var ratesDep=new Deps.Dependency;
UI.registerHelper('hotListRates', function(){
  rates=  self.rates;
  return Template.hotListRatesTemplate;
});

var updateRates=function(){
  HotLists.update({ _id: Session.get('entityId') },{ $set: { hotListRates: self.rates } }, function (err, result) {
    if (err){
      console.log(err);
    }
  });
};

var loadRates = function () {
  var hotList = HotLists.findOne({
    _id: Session.get('entityId')
  });

  if (hotList.hotListRates) self.rates=hotList.hotListRates;
};

// Add Rates

AutoForm.hooks({
  AddHotListRate: {
    onSubmit: function(rate) {
      self.rates.push(rate);
      updateRates(rate);
      this.done();
      this.resetForm();
      return false;
    }
  }
});

// Edit Rates

Template.hotListRates.helpers({
  rates: function(){
    ratesDep.depend();
    return self.rates
  },
  getType: function(typeId){
    return LookUps.findOne({lookUpCode: Enums.lookUpTypes.hotList.rate.lookUpCode,_id:typeId});
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  },
  editMode: function(){
    return self.editMode;
  },
  getAvailableType: function() {
    var rateTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.hotList.rate.lookUpCode}).fetch();
    ratesDep.depend();
    return _.map(_.filter(rateTypes, function (type) {
      return !_.findWhere(self.rates, { type: type._id });
    }), function (rateType) {
      return {label: rateType.displayName, value: rateType._id};
    });
  },
  colorHotListRateEdit: function() {
    return self.editMode ? '#008DFC' : '';
  }
});

Template.hotListRates.events({
  'click .editRate': function(){
    self.editMode= ! self.editMode;
  },
  'click .cancelButtonRates': function(){
    loadRates();
    self.editMode=false;
  },
  'click .saveButtonRates': function(){
    updateRates();
    self.editMode=false;
  },
  'click .removeRate': function(e, ctx){
    self.rates.splice(self.rates.indexOf(this), 1);
    updateRates();
    ratesDep.changed();
  },
  'change .payRateInput': function(e, ctx){
    this.pay= e.target.value;
    this.pay=  Utils.setDecimal(this.pay);
  },
  'change .billRateInput': function(e, ctx){
    this.bill= e.target.value;
    this.bill=  Utils.setDecimal(this.bill);
  }
});








Template.jobRates.helpers({
  rates:function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    return job.rates
  },
  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  }
})
Template.jobRates.events({
  'click .addRate': function(){
    Composer.showModal('addJobRate');
  }
})
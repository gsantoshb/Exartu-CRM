Template.jobRates.helpers({
  rates:function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    return job.jobRates
  },
  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  }
})
Template.jobRates.events({
  'click .addRate': function(){
    Composer.showModal('addJobRate');
  }
})
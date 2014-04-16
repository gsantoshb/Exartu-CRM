// employee past jobs

Meteor.startup(function () {
    Meteor.methods({
        addEditPastJob: function(employeeId, pastJob){
            var contactable=Contactables.findOne({ _id: employeeId });
            if(!contactable){
                throw new Meteor.Error(400, "contactable not found");
            }
            if(!contactable.pastJobs){
                throw new Meteor.Error(400, "the contactable does not have past jobs");
            }
            if (pastJob._id){
                var old= _.findWhere(contactable.pastJobs,{ _id: pastJob._id });
                if (old){
                    Contactables.update({
                        _id: employeeId,
                        'pastJobs._id':pastJob._id
                    },{
                        $set:{
                            'pastJobs.$': pastJob
                        }
                    });
                }else{
                    throw new Meteor.Error(400, "the element tou are trying to edit does not exists");
                }
            }else{
                pastJob._id=Meteor.uuid();
                Contactables.update({ _id: employeeId },{ $push: { pastJobs: pastJob } });
            }

        }
    });
})
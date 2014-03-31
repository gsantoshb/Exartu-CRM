// employee pasts jobs

Meteor.startup(function () {
    Meteor.methods({
        addPastJob: function(employeeId, pastJob){
            var contactable=Contactables.findOne({_id:employeeId});
            if(!contactable){
                throw new Meteor.Error(400, "contactable not found");
            }
            if(!contactable.pastJobs){
                throw new Meteor.Error(400, "the contactable does not have past jobs");
            }
            Contactables.update({_id: employeeId},{$push:{pastJobs: pastJob}});

        }
    });
})
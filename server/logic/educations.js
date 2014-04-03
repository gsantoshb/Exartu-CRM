// employee pasts jobs

Meteor.startup(function () {
    Meteor.methods({
        addEditEducations: function(employeeId, education){
            var contactable=Contactables.findOne({ _id: employeeId });
            if(!contactable){
                throw new Meteor.Error(400, "contactable not found");
            }
            if(!contactable.educations){
                throw new Meteor.Error(400, "the contactable does not have education");
            }
            if (education._id){
                var old= _.findWhere(contactable.educations,{ _id: education._id });
                if (old){
                    Contactables.update({
                        _id: employeeId,
                        'educations._id':education._id
                    },{
                        $set:{
                            'educations.$': education
                        }
                    });
                }else{
                    throw new Meteor.Error(400, "the element tou are trying to edit does not exists");
                }
            }else{
                education._id=Meteor.uuid();
                Contactables.update({ _id: employeeId },{ $push: { educations: education } });
            }

        }
    });
})
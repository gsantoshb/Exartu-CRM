Meteor.startup(function(){
    if (!process.dType){
        dType={};
    }

    dType.updater=function(doc, fieldNames, modifier){
        var relations= dType.core.getRelations(doc);
        _.each(fieldNames,function(name){
            if (relations[name]){
                //update
            }
        })

    };
});
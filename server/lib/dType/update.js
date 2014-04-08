if (!process.dType){
    dType={};
}

dType.update=function(doc, fieldNames, modifier){
    var relations= dType.core.getRelations(doc);
    _.each(fieldNames,function(name){
        if (relations[name]){
            //update
        }
    })

};
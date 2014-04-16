/**
 * Created by javier on 20/03/14.
 */
seedSystemContactMethods = function (){
    var systemContactMethods =
        [
            {
                displayName: 'Cell Phone',
                type: Enums.contactMethodTypes.cellPhone
            },
            {
                displayName: 'Email',
                type: Enums.contactMethodTypes.email
            },
            {
                displayName: 'Other',
                type: Enums.contactMethodTypes.other
            },
        ];

    _.forEach(systemContactMethods, function (cmType) {
        var oldCM=  ContactMethods.findOne({
            hierId: ExartuConfig.SystemHierarchyId,
            type: cmType.type
        });
       if ( ! oldCM ){
           ContactMethods.insert({
                hierId: ExartuConfig.SystemHierarchyId,
                displayName: cmType.displayName,
                type: cmType.type
            });
       } else{
           ContactMethods.update({ _id: oldCM._id },{ $set:{
               displayName: cmType.displayName
            }});
       }
    })
}


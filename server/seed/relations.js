   seedSystemRelations = function () {
       var systemRelations = [
           {
               name: 'CustomerContacts',
               obj1: 'Contact',
               obj2: 'Customer',
               visibilityOn1: {
                   name: 'customer',
                   collection: 'Contactables',
                   defaultValue: null,
                   cardinality: {
                       min: 0,
                       max: 1
                   },
                   showInAdd: true,
               },
               visibilityOn2: {
                   name: 'contacts',
                   collection: 'Contactables',
                   defaultValue: [],
                   cardinality: {
                       min: 0,
                       max: Infinity
                   },
                   showInAdd: true,
               },
               cascadeDelete: false,
            },
           {
               name: 'asd',
               obj1: 'Employee',
               obj2: 'Customer',
               visibilityOn1: {
                   name: 'asdEmp',
                   collection: 'Contactables',
                   defaultValue: null,
                   cardinality: {
                       min: 0,
                       max: 1
                   },
               },
               visibilityOn2: {
                   name: 'asdCus',
                   collection: 'Contactables',
                   defaultValue: null,
                   cardinality: {
                       min: 0,
                       max: 1
                   },
               },
               cascadeDelete: false,
            },
        ];

       _.forEach(systemRelations, function (rel) {
           var oldRel = Relations.findOne({
               name: rel.name
           });
           if (oldRel == null) {
               //console.log('inserting relation ' + rel.name);
               rel.hierId = ExartuConfig.SystemHierarchyId;
               //console.dir(rel);
               Relations.insert(rel);
           } else {
               //console.log('updating relation ' + rel.name);
               Relations.update({
                   _id: oldRel._id
               }, {
                   $set: {
                       visibilityOn1: rel.visibilityOn1,
                       visibilityOn2: rel.visibilityOn2,
                       cascadeDelete: rel.cascadeDelete
                   }
               })
           }
       });
   }
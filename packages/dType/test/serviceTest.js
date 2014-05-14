Tinytest.add('dType - service Test', function(test){
    var foo= new Meteor.Collection(null);
    var newService=dType.constructor.service;

    newService({
        name: 'tags',
        getSettings: function(options){
            return {name: 'tags', objType: options.objType};
        },
        isValid: function(value, serviceSettings){
            return _.isArray(value);
        },
        initValue: function(value){
            return []
        },
        insert:function(){
            console.log('insert callback')
        },
        update:function(){
            console.log('update callback')
        }
    })
    console.log('\nservice');
    console.dir(dType.core.getService('tags'));

    dType.constructor.objType({
        name: 'foo',
        services:[{ name: 'tags', options: { objType:'foo' } }],
        collection: foo
    });

    console.log('\nobjType');
    console.dir(dType.core.getObjType('foo'));

    var id=foo.insert({
        objNameArray:['foo']
    });
    test.notEqual(foo.findOne({_id: id}),undefined, 'service');
    console.log('\nobj');
    console.dir(foo.findOne({_id: id}));
})
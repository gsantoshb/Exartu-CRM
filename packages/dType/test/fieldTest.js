Tinytest.add('dType - field Test', function(test){
    var foo= new Meteor.Collection(null);
    var LookUps= new Meteor.Collection(null);
    LookUps.insert({
        name:'a'
    });
    LookUps.insert({
        name:'b'
    });
    LookUps.insert({
        name:'c'
    });
//    debugger;
    dType.core.createFieldType({
        name: 'lookUp',
        validate: function(value, fieldDefinition){
            var lookUp=LookUps.findOne({ _id: value });
            return !! lookUp;
        },
        defaultValue: null
    })
    dType.constructor.objType({
        name: 'foo',
        fields:[{
            name: 'nonEmpty',
            regex: '.+',
            required: true
        },{
            name: 'anyString',
            regex: '.*'
        },{
            name: 'number',
            fieldType: 'number'
        },{
            name: 'date',
            fieldType: 'date'
        },
        {
            name: 'enum',
            fieldType: 'enum',
            options:['one', 'two', 'three'],
            defaultValue: 'one'
        },
        {
            name: 'boolean',
            fieldType: 'boolean',
            defaultValue: true
        },{
            name: 'lookUp',
            fieldType: 'lookUp',
            defaultValue: LookUps.findOne({name:'b'})._id
        }],
        collection: foo
    });
    var id=null;
    console.log('******************* nonEmpty ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
//        nonEmpty: '',
//        anyString: '',
//        number: '',
//        date: '',
//        enum: '',
//        boolean: ''
    });

    test.equal(foo.findOne({_id: id}), undefined,'nonEmpty');

    id=null;
    console.log('******************* nonEmpty 1 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: '',
//        anyString: '',
//        number: '',
//        date: '',
//        enum: '',
//        boolean: ''
    });
    test.equal(foo.findOne({_id: id}), undefined,'nonEmpty 1');

    id=null;
    console.log('******************* nonEmpty 2 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'something'
//        anyString: '',
//        number: '',
//        date: '',
//        enum: '',
//        boolean: ''
    });
    test.notEqual(foo.findOne({_id: id}), undefined,'nonEmpty 2');
    test.equal(foo.findOne({_id:id}), {
        objNameArray: ['foo'],
        nonEmpty: 'something',
        _id:id,
        anyString: dType.core.getFieldType('string').defaultValue,
        number: dType.core.getFieldType('number').defaultValue,
        date: dType.core.getFieldType('date').defaultValue,
        enum: 'one',
        boolean: dType.core.getFieldType('boolean').defaultValue,
        lookUp:LookUps.findOne({name:'b'})._id
    },'nonEmpty 2: object check');


    id=null;
    console.log('******************* anyString 1 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'empty anyString',
        anyString: '',
//        number: '',
//        date: '',
//        enum: '',
//        boolean: ''
    });
    test.notEqual(foo.findOne({_id: id}), undefined,'anyString 1');

    id=null;
    console.log('******************* anyString 2 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'any',
        anyString: 'any',
//        number: '',
//        date: '',
//        enum: '',
//        boolean: ''
    });
    test.notEqual(foo.findOne({_id: id}), undefined,'anyString 2');

    id=null;
    console.log('******************* number 2 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'NAN',
//        anyString: 'any',
        number: 'NAN',
//        date: '',
//        enum: '',
//        boolean: ''
    });
    test.equal(foo.findOne({_id: id}), undefined,'number 2');

    id=null;
    console.log('******************* lookUp ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'badLookup',
//        anyString: 'any',
//        number: 'NAN',
//        date: '',
//        enum: '',
//        boolean: ''
        lookUp:'badLookup'
    });
    test.equal(foo.findOne({_id: id}), undefined,'lookUp');

    id=null;
    console.log('******************* lookUp 2 ***********************');
    id=foo.insert({
        objNameArray: ['foo'],
        nonEmpty: 'badLookup',
//        anyString: 'any',
//        number: 'NAN',
//        date: '',
//        enum: '',
//        boolean: ''
        lookUp: LookUps.findOne({name: 'c'})._id
    });
    test.notEqual(foo.findOne({_id: id}), undefined,'lookUp 2');
    test.equal(foo.findOne({_id: id}).lookUp, LookUps.findOne({name: 'c'})._id,'lookUp 2 - value of the lookup');

});
Tinytest.add('dType - field Test', function(test){
    var foo= new Meteor.Collection(null);
//    debugger;
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
        boolean: dType.core.getFieldType('boolean').defaultValue
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

});
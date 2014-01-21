fieldType = {
    string: 0,
    int: 1,
    date: 2,
    select: 3,
    checkbox: 4
};

EmployeeType = {
    _id: 0,
    name: 'Employee',
    services: ['messages', 'tasks'],
    fields: [{
        name: 'test',
        regex: /.*/,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: true
 }, {
        name: 'test2',
        regex: /./,
        type: fieldType.string,
        defaultValue: '',
        showInAdd: true
 }]
}
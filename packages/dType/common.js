if (!dType){
    dType={};
}
dType.fieldTypes={
    string: 0,
    number: 1,
    date: 2,
    enum: 3,
    boolean: 4,
    lookUp: 5,
    defaultVal: {}
}
dType.fieldTypes.defaultVal[dType.fieldTypes.string]= '';
dType.fieldTypes.defaultVal[dType.fieldTypes.number]= 0;
dType.fieldTypes.defaultVal[dType.fieldTypes.date]= null;
dType.fieldTypes.defaultVal[dType.fieldTypes.enum]= null;
dType.fieldTypes.defaultVal[dType.fieldTypes.boolean]= true;
dType.fieldTypes.defaultVal[dType.fieldTypes.lookUp]= null;

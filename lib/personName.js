function PersonName(first,last)
{
    this.first=first;
    this.last=last;
};

PersonName.prototype= {
    constructor: PersonName,
    toString: function () { return this.first+ ', ' + this.last;},
    clone: function() { return new PersonName(this.first,this.last); },
    equals: function(other)
    {
        if (!(other instanceof  PersonName)) return false;
        return other.toString()==this.toString();
    },
    typeName: function() {return "PersonName";},
    toJSONValue: function()
    {
        return { first: this.first, last: this.last};
    }
}

testemp={
    age:26,
    PersonName: new PersonName('joe','smith')
}


EJSON.addType("PersonName",function fromJSONValue(value) { return new PersonName(value.first,value.last);  })

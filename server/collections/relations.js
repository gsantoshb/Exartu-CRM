function setIfNotSet(doc, rel) {
    //checking if the doc has the rel
    if (!doc[rel.name]) {
        doc[rel.name] = rel.defaultValue;
    }
};

var checkCardinality = function (value, card) {
    if (!value) {
        //the cardinality allows no value?
        return card.min <= 0;
    }
    if (typeof value == typeof[]) {
        if (card.max == 1) {
            return false;
        } else {
            return value.length <= card.max && value.length >= card.min;
        }
    } else {
        if (card.max > 1) {
            return false;
        }
    }
    return true;
}

beforeUpdate = {};
beforeUpdate.oneWay = function (value, rel) {
    if (rel.cardinality.max == 1) {

        //checking cardinality
        if (!checkCardinality(value, rel.cardinality))
            return false;

        //check if the value's type is the same as this relation's target (rel.obj2)
        return value.types.indexOf(rel.obj2) >= 0;


    }
    if (rel.cardinality.max == Infinity) {

        if (!value) {
            //the cardinality allows no value?
            return rel.cardinality.min <= 0;
        }

        if (typeof value != typeof[]) {
            //the value must allways be an array
            return false;
        } else {
            //checking if all the values are correct
            var valid = true;
            _.every(value, function (val) {
                if (val.types.indexOf(rel.obj2) < 0) {
                    valid = false;
                }
                return valid;
            })
            return valid;
        }
    }
}

beforeUpdate.twoWay = function (id, objTypeField, oldObjTypeField, rel1, rel2, obj2TypeField) {
    var value = objTypeField[rel1.name];
    if (rel1.cardinality.max == 1) {
        console.log('cardinality ==1')
        if (!checkCardinality(value, rel1.cardinality))
            return false;

        //check if the value's type is the same as this relation's target (rel.obj2)
        //        if (!value.type.indexOf(rel1.obj2) >= 0)
        //            return false;


        collection2 = Collections[rel1.collection];
        var obj2 = collection2.findOne({
            _id: value
        });

        if (rel2.cardinality.max == 1) {
            console.log('cardinality ==1')
            if (obj2[rel2.name] && obj2[rel2.name] != id) {
                console.log('cannot update the ' + rel1.name + 'has value: ' + obj2[rel2.name]);
                return false;
            } else {
                var aux = {};

                aux[obj2TypeField + '.' + rel2.name] = id;

                console.log('updating obj2 with ' + obj2TypeField);
                console.dir(aux);
                collection2.update({
                    _id: obj2._id
                }, {

                    $set: aux
                });
                return true;
            }
        } else {
            if (!value) {
                var aux = {};
                aux[rel2.name] = id;
                collection2.update({
                    _id: oldObjTypeField[rel1.name]
                }, {
                    $pull: aux
                })
                return false;
            } else {
                collection2.update({
                    _id: obj2._id
                }, {
                    $addToSet: aux
                })
                return true;
            }

        }

    }
    if (rel1.cardinality.max == Infinity) {
        return false;
    }
}

beforeUpdateRelation = function (obj, rel, fieldModified, objTypeField, oldObjTypeField) {

    if (rel.visibilityOn1) {
        if (!rel.visibilityOn2) {
            return beforeUpdate.oneWay(obj[fieldModified], rel.visibilityOn1);
        } else {
            console.log('2 way')
            return beforeUpdate.twoWay(obj._id, objTypeField, oldObjTypeField, rel.visibilityOn1, rel.visibilityOn2, rel.obj2);
        }
    }
}
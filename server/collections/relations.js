var CustomerContacts = {
    name: 'CustomerContacts',
    obj1: CustomerContactType._id,
    obj2: CustomerType._id,
    visibilityOn1: {
        name: 'customer',
        collection: Contactables,
        defaultValue: null,
        cardinality: {
            min: 0,
            max: 1
        },
    },
    visibilityOn2: {
        name: 'customer',
        collection: Contactables,
        defaultValue: null,
        cardinality: {
            min: 0,
            max: 1
        },
    },
    cascadeDelete: false,
};

/*
 * creates a function that will be called before updating a doc of type rel.obj1
 * the function will validate the new value depending on the cardinality of the rel
 * and maintining the consistency in a two-way visibility relation
 */
function setIfNotSet(doc, rel) {
    //checking if the doc has the rel
    if (!doc[rel.name]) {
        doc[rel.name] = rel.defaultValue;
    }
};

var checkCardinality = function (value, card) {
    if (!value) {
        //the cardinality allows no value?
        return rel.cardinality.min <= 0;
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
beforeUpdate.oneWay = function (rel) {
    if (rel.cardinality.max == 1) {
        return function (doc, fieldNames, options) {

            setIfNotSet(doc, rel);

            //checking if the value of this rel is being changed
            if (!fieldNames.indexOf[rel.name]) {
                return true;
            }

            var value = doc[rel.name];

            //checking cardinality
            if (!checkCardinality(value, rel.cardinality))
                return false;

            //check if the value's type is the same as this relation's target (rel.obj2)
            return value.types.indexOf(rel.obj2) >= 0;

        }
    }
    if (rel.cardinality.max == Infinity) {
        return function (doc, fieldNames, modifier, options) {
            //checking if the doc has the rel
            if (!modifier[rel.name]) {
                modifier[rel.name] = rel.defaultValue;
            }
            //checking if the value of this rel is being changed
            if (!fieldNames.indexOf[rel.name]) {
                return true;
            }


            var value = modifier[rel.name];

            //checking cardinality

            if (!val) {
                //the cardinality allows no value?
                return rel.cardinality.min <= 0;
            }

            if (typeof value != typeof[]) {
                //the must allways be an array
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
}

beforeUpdate.twoWay = function (rel1, rel2) {

    if (rel1.cardinality.max == 1) {
        return function (doc, fieldNames, modifier, options) {

            setIfNotSet(doc, rel1);

            //checking if the value of this rel is being changed
            if (!fieldNames.indexOf[rel1.name]) {
                return true;
            }

            var value = doc[rel1.name];

            //checking cardinality
            if (!checkCardinality(value, rel1.cardinality))
                return false;

            //check if the value's type is the same as this relation's target (rel.obj2)
            if (!value.types.indexOf(rel1.obj2) >= 0)
                return false;

            doc2 = rel1.collection.findOne({
                _id: value
            });
            if (!doc2) {
                return false;
            }
            var value2 = doc2[rel2.name];

            if (rel2.cardinality.max == 1) {
                if (value2) {
                    return false;
                } else {
                    rel1.collection.update({
                        _id: doc2._id
                    }, {
                        $set: {}[rel2.name] = doc._id
                    });
                }
            } else {
                //i asume card.max==Infinite       todo: contemplate other cases
                value2.push(doc._id);
                rel1.collection.update({
                    _id: doc2._id
                }, {
                    $set: {}[rel2.name] = value2
                });
            }

        }
    }
    if (rel1.cardinality.max == Infinity) {
        return function (doc, fieldNames, modifier, options) {
            //todo
            //checking if the doc has the rel
            //            if (!modifier[rel.name]) {
            //                modifier[rel.name] = rel.defaultValue;
            //            }
            //            //checking if the value of this rel is being changed
            //            if (!fieldNames.indexOf[rel.name]) {
            //                return true;
            //            }
            //
            //
            //            var value = modifier[rel.name];
            //
            //            //checking cardinality
            //
            //            if (!val) {
            //                //the cardinality allows no value?
            //                return rel.cardinality.min <= 0;
            //            }
            //
            //            if (typeof value != typeof[]) {
            //                //the must allways be an array
            //                return false;
            //            } else {
            //                //checking if all the values are correct
            //                var valid = true;
            //                _.every(value, function (val) {
            //                    if (val.types.indexOf(rel.obj2) < 0) {
            //                        valid = false;
            //                    }
            //                    return valid;
            //                })
            //                return valid;
            //            }
        }
    }
}


var compileRelation = function (rel) {

    if (rel.visibilityOn1) {
        obj1 = _.findWhere(ObjectTypes, {
            _id: rel.obj1
        });
        var rel1 = rel.visibilityOn1;

        //one way visibility
        if (!rel.visibilityOn2) {

            rel1.beforeUpdate = beforeUpdate.oneWay(rel1);

            obj1.relations.push(rel1);

        } else {
            //two way visibility
            obj2 = _.findWhere(ObjectTypes, {
                _id: rel.obj2
            });
            var rel2 = rel.visibilityOn2;
            rel1.beforeUpdate = beforeUpdate.twoWay(rel1, rel2);
            rel2.beforeUpdate = beforeUpdate.twoWay(rel2, rel1);
            obj1.relations.push(rel1);
            obj2.relations.push(rel2);

        }
    };
}
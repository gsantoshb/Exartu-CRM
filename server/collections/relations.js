Relations.after.insert(function (userId, doc) {
    compileRelation(doc);
})
Relations.after.update(function (userId, doc, fieldNames, modifier, options) {
    console.dir(options);
    compileRelation(doc);
})

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


beforeUpdate.twoWay = function (value, rel1, rel2) {

    if (rel1.cardinality.max == 1) {
        return false
        /*
        function (doc, fieldNames, modifier, options) {

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
            col1 = Collections[rel1.collection];
            doc2 = col1.findOne({
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
                    col1.update({
                        _id: doc2._id
                    }, {
                        $set: {}[rel2.name] = doc._id
                    });
                }
            } else {
                //i asume card.max==Infinite       todo: contemplate other cases
                value2.push(doc._id);
                col1.update({
                    _id: doc2._id
                }, {
                    $set: {}[rel2.name] = value2
                });
            }

        }*/
    }
    if (rel1.cardinality.max == Infinity) {
        return false;
        //function (doc, fieldNames, modifier, options) {
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
        // }
    }
}


var compileRelation = function (rel) {

    if (rel.visibilityOn1) {
        obj1 = ObjectTypes.findOne({
            name: rel.obj1
        });
        var rel1 = rel.visibilityOn1;

        //one way visibility
        if (!rel.visibilityOn2) {

            //            rel1.beforeUpdate = beforeUpdate.oneWay(rel1).toString();
            rel1.definition = rel.name;
            ObjectTypes.update({
                name: rel.obj1
            }, {
                $addToSet: {
                    relations: rel1
                }
            })

        } else {
            //two way visibility
            obj2 = ObjectTypes.findOne({
                name: rel.obj2
            });
            var rel2 = rel.visibilityOn2;
            //            rel1.beforeUpdate = beforeUpdate.twoWay(rel1, rel2).toString();
            //            rel2.beforeUpdate = beforeUpdate.twoWay(rel2, rel1).toString();
            rel1.definition = rel.name;
            rel2.definition = rel.name;

            ObjectTypes.update({
                name: rel.obj1
            }, {
                $addToSet: {
                    relations: rel1
                }
            })
            ObjectTypes.update({
                name: rel.obj2
            }, {
                $addToSet: {
                    relations: rel2
                }
            })

        }
    };
}

beforeUpdateRelation = function (val, rel) {
    var relDefinition = Relations.findOne({
        name: rel.name
    });
    if (relDefinition.visibilityOn1) {
        if (!rel.visibilityOn2) {
            beforeUpdate.oneWay(val, rel);
        } else {
            beforeUpdate.twoWay(val, rel, relDefinition.visibilityOn2);
        }
    }
}
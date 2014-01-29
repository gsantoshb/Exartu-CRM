/*
 * before update the value of a dynamic relation this function is called
 * in progress
 */

beforeUpdateRelation = function (obj, rel, objTypeName) {
	if (rel.visibilityOn1) {
		if (!rel.visibilityOn2) {
			return beforeUpdate.oneWay(obj[objTypeName][rel.visibilityOn1.name], rel.visibilityOn1);
		} else {
			return beforeUpdate.twoWay(obj, obj[objTypeName], rel);
		}
	}
}

beforeUpdate = {};
beforeUpdate.oneWay = function (value, rel) {
	if (rel.cardinality.max == 1) {
		//checking cardinality
		if (!checkCardinality(value, rel.cardinality))
			return false;

		//check if the value's type is the same as this relation's target (rel.obj2)
		return checkType(value, rel.obj2);
	}
	if (rel.cardinality.max == Infinity) {

		if (!checkCardinality(value, rel.cardinality))
			return false;

		//checking if all the values are correct
		var valid = true;
		_.every(value, function (val) {
			valid = checkType(val, rel.obj2);

			return valid;
		});

		return valid;
	}
}

beforeUpdate.twoWay = function (obj, objTypeField, rel) {
	var rel1;
	var rel2;
	var targetName;
	var id = obj._id;
	if (obj.objNameArray.indexOf(rel.obj1) >= 0) {
		rel1 = rel.visibilityOn1;
		rel2 = rel.visibilityOn2;
		targetName = rel.obj2;
	} else {
		rel1 = rel.visibilityOn2;
		rel2 = rel.visibilityOn1;
		targetName = rel.obj1;
	}

	var oldObjTypeField = Contactables.findOne({
		_id: obj._id
	})[targetName];

	var value = objTypeField[rel1.name];
	if (rel1.cardinality.max == 1) {

		if (!checkCardinality(value, rel1.cardinality))
			return false;
		var collection2 = Collections[rel1.collection];
		//check if the value's type is the same as this relation's target (rel.obj2)
		if (!checkType(value, targetName, collection2))
			return false;

		var obj2 = collection2.findOne({
			_id: value
		})[targetName];

		/*********  1 - 1  ******************************/
		if (rel2.cardinality.max == 1) {
			console.log('cardinality == 1')
			if (obj2[rel2.name] && obj2[rel2.name] != id) {
				// TODO: Fix inconsistency
				return false;
			} else {
				var aux = {};

				aux[targetName + '.' + rel2.name] = id;
				collection2.update({
					_id: obj2._id
				}, {

					$set: aux
				});
				return true;
			}
		}

		/*********  1 - N  ******************************/
		else {
			if (!value) {
				var aux = {};
				aux[rel2.name] = null;
				console.log('updating ' + oldObjTypeField[rel1.name]);
				collection2.update({
					_id: oldObjTypeField[rel1.name]
				}, {
					$pull: aux
				})
				return true;
			} else {
				var aux = {};
				aux[targetName + '.' + rel2.name] = id;
				console.log('updating ' + obj2._id);
				//                console.dir(aux);
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
		if (!checkCardinality(value, rel1.cardinality)) {
			console.error('card fail');
			return false;
		}

		var collection2 = Collections[rel1.collection];

		//check if the value's type is the same as this relation's target (rel.obj2)
		//        console.log(targetName);
		var valid = true;
		_.every(value, function (val) {
			valid = checkType(val, targetName, collection2);
			if (!valid) {
				console.error('type fail ' + val + ' valid: ' + valid);
			}
			return valid;
		})
		if (!valid) {
			return false;
		}
		//        console.dir(oldObjTypeField);
		var oldValue = oldObjTypeField[rel1.name];
		var newTargets = _.difference(value, oldValue);
		var oldTargets = _.difference(oldValue, value);

		/*********  N - 1  ******************************/
		if (rel2.cardinality.max == 1) {
			//            console.log('card 1');
			var valid = true
			var value2;
			_.every(newTargets, function (obj2) {
				value2 = collection2.find({
					_id: obj2
				});
				valid = (value2[rel2.name] == undefined) || (value2[rel2.name] == id)
				if (!valid) {
					console.error('cannot update ' + obj2 + ' allready has a value: ' + value2[rel2.name])
				}
				return valid;
			})
			if (!valid)
				return false;

			var aux = {};


			if (oldTargets.length > 0) {
				aux[targetName + '.' + rel2.name] = null;

				console.info('updating old values....')
				console.dir(oldTargets);
				console.dir(aux);

				collection2.update({
					_id: {
						$in: oldTargets
					}
				}, {
					$set: aux
				}, {
					multi: true
				});
			}
			if (newTargets.length > 0) {
				aux[targetName + '.' + rel2.name] = id;

				console.info('updating new values....')
				console.dir(newTargets);
				console.dir(aux);

				collection2.update({
					_id: {
						$in: newTargets
					}
				}, {
					$set: aux
				}, {
					multi: true
				});
			}
			return true;

		}
		/*********  N - N  ******************************/
		else {
			return false;

		}
	}
}

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
/*
 * check if obj is of type typeName
 * params:
 *  obj ->  the id of the object
 *          or the actual object
 * typeName ->      the name of the type we are matching against (ex: 'Employee')
 * collection ->    if obj is of the id of the obj this parameter is required,
 *                  it can be the name of the collection (ex: 'Contactables')
 *                  or it can be the actual meteor's collection
 */
var checkType = function (obj, typeName, collection) {
	//    todo: receive type and check it
	if (typeof obj == typeof {})
		return obj.type ? typeof obj.type == typeof[] ? obj.type.indexOf(typeName) >= 0 : false : false;
	else {
		var col = typeof collection == typeof "" ? Collections[collection] : collection;
		//        console.log(obj);
		//        console.dir(collection);
		//        console.log(typeName);
		var target = col.findOne({
			_id: obj,
			objNameArray: typeName
		}, {
			_id: 1
		});
		//        console.dir(target);
		//        console.log(target != undefined);
		return target != undefined;

	}
}

Meteor.methods({
	getShowInAddRelations: function (objName) {
		var relations = [];
		var rels = Relations.find({
			$or: [
				{
					obj1: objName,
					'visibilityOn1.showInAdd': true
				}, {
					obj2: objName,
					visibilityOn2: {
						$exists: true
					},
					'visibilityOn2.showInAdd': true
				}
			]
		}).fetch();

		_.forEach(rels, function (relation) {
			var objRel;
			var query = {};

			if (relation.obj1 == objName) {
				objRel = relation.visibilityOn1;
				query[relation.obj2] = {};
				query[relation.obj2]['$exists'] = true;
			} else {
				objRel = relation.visibilityOn2;
				query[relation.obj1] = {};
				query[relation.obj1]['$exists'] = true;
			}

			relations.push({
				cardinality: objRel.cardinality,
				target: {
					collection: objRel.collection,
					query: query
				}
			});
		});

		return relations;
	}
});
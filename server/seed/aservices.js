//define all services
dType.constructor.service({
    name: 'tags',
    getSettings: function(options){
        return {name: 'tags'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value) && _.every(value,function(t){
            return _.isString(t);
        });
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'messages',
    getSettings: function(options){
        return {name: 'messages'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'tasks',
    getSettings: function(options){
        return {name: 'tasks'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'posts',
    getSettings: function(options){
        return {name: 'posts'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'contactMethods',
    getSettings: function(options){
        return {name: 'contactMethods'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})

dType.constructor.service({
    name: 'pastJobs',
    getSettings: function(options){
        return {name: 'pastJobs'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'educations',
    getSettings: function(options){
        return {name: 'educations'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'candidates',
    getSettings: function(options){
        return {name: 'candidates'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value){
        return []
    }
})
dType.constructor.service({
    name: 'jobRates',
    getSettings: function(options){
        return {name: 'jobRates'};
    },
    isValid: function(value, serviceSettings){
        return _.isArray(value);
    },
    initValue: function(value, serviceSettings, type, obj){
      var result=[];
      if (obj['Temporary']){
        var frequency = LookUps.findOne({ codeType: Enums.lookUpTypes.payRate.frequencies.code, _id: obj.Temporary.frequency });
        if(! frequency) return;

        var pay= (obj.Temporary.pay / frequency.inHours);
        var bill=pay+pay*(obj.fee/100);

        var rateType = JobRateTypes.findOne({displayName:'RegularTime'});
        if (!_.findWhere(value, { type: rateType._id })){
          result.push({ type: rateType._id, pay: pay, bill: bill });
        }
//        rateType = JobRateTypes.findOne({displayName:'Over Time'});
//        if (!_.findWhere(value, { type: rateType._id })){
//          result.push({ type: rateType._id, pay: pay*1.5, bill: bill*1.5 });
//        }
//        rateType = JobRateTypes.findOne({displayName:'Double Time'});
//        if (!_.findWhere(value, { type: rateType._id })){
//          result.push({ type: rateType._id, pay: pay*2, bill: bill*2 });
//        }

      }else if (obj['Direct Hire']){
        rateType = JobRateTypes.findOne({displayName:'Salary'});
        var pay= (obj['Direct Hire'].salary);
        var bill=pay+pay*(obj.fee/100); //round 2 decimals
        bill=Math.round(bill * 100) / 100; //round 2 decimals
        if (!_.findWhere(value, { type: rateType._id })){
          result.push({ type: rateType._id, pay: pay, bill: bill });
        }
      }
      return result;
    }
})



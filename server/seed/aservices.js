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
    name: 'notes',
    getSettings: function(options){
        return {name: 'notes'};
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
      var similar_job=Jobs.findOne({customer:obj.customer , jobTitle: obj.jobTitle},{sort: { dateCreated: -1},limit:1});
      if (similar_job  && similar_job.jobRates) return similar_job.jobRates;
      return result;

//
    }
})



FileUploader.post = function(endpoint, file, metadata) {
  var cb;
  if (arguments[arguments.length - 1] instanceof Function)
    cb = arguments[arguments.length - 1];

  var formData = new FormData();
  formData.append('file', file);

  var params = {
    userId: Meteor.userId(),
    loginToken: localStorage.getItem('Meteor.loginToken')
  };

  _.extend(params, metadata);

  HTTP.post(Meteor.absoluteUrl(endpoint), {
    content: formData,
    params: params
  }, function(err, result) {
    cb && cb.call({}, err, result);
  });
};

FileUploader.postProgress = function(endpoint, file, progress, metadata) {
  var cb;
  if (arguments[arguments.length - 1] instanceof Function)
    cb = arguments[arguments.length - 1];
  var formData = new FormData();
  formData.append('file', file);

  //var params = {
  //  userId: Meteor.userId(),
  //  loginToken: localStorage.getItem('Meteor.loginToken')
  //};

  //_.extend(params, metadata);
  var xhr = new XMLHttpRequest();
  xhr.upload.onprogress = function(progressEvent) {
    if(!progress.isProcessing()){
      progress.start();
      progress.displayName = "Uploading...";
    }
    console.log(progress.get());
    progress.set(Math.round(progressEvent.loaded / progressEvent.total *100));
    if(progress.get()===100){
      progress.end();
    }


  };


  xhr.onreadystatechange = function(){
    if (xhr.readyState == xhr.DONE){
      if (xhr.status == 200) {
        cb.call({}, null, xhr.responseText);
      }else{
        cb.call({},"Error", null);
      }
    }
  };

  xhr.open('POST', endpoint+'?userId='+Meteor.userId()+'&loginToken='+localStorage.getItem('Meteor.loginToken')+'&idProgressBar='+file.id);


  //xhr.setRequestHeader('userId', Meteor.userId());
  //xhr.setRequestHeader('params', params);


  xhr.send(formData);
  //HTTP.post(Meteor.absoluteUrl(endpoint), {
  //  content: formData,
  //  params: params
  //}, function(err, result) {
  //  cb && cb.call({}, err, result);
  //});
};

FileUploader.getUrl = function (endpoint, fileId, params) {
  return Meteor.absoluteUrl(endpoint + '/download/' + fileId + _parseExtraParameters(params));
};

var _parseExtraParameters = function (parameters) {
  if (! parameters) return '';

  var queryParams = '?';
  _.forEach(parameters, function (value, fieldName) {
    if (!queryParams == '?')
      queryParams +=  '&';
    queryParams +=  fieldName + '=' + value;
  });

  return queryParams;
};
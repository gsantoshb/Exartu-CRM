var patternFind = /data-mergefield="(\w+)"/g;
var getPatternReplace = function (id) {
  return new RegExp("<[^><]*data-mergefield=\"" + id + "\"[^><]*>");
};

HotListManager = {
  createHotList: function (hotlist) {
    return HotLists.insert(hotlist);
  }
};
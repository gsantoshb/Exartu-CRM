var patternFind = /data-mergefield="(\w+)"/g;
var getPatternReplace = function (id) {
  return new RegExp("<[^><]*data-mergefield=\"" + id + "\"[^><]*>");
};

HotListManager = {
  addHotList: function (hotlist) {
    return HotLists.insert(hotlist);
  }
};
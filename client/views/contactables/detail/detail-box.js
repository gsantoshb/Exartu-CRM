EditMode = {
  val: false,
  dep: new Deps.Dependency,
  show: function (file) {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(EditMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  }
});


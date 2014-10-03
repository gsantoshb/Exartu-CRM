var tabs;
var selectedTab;
var template;
var context;
var selectedTabDep = new Deps.Dependency;

Template.detailTabs.created = function() {
  selectedTab = this.data.selected || this.data.tabs[0];
  template = this.data.template;
  context = this.data.context;
};

Template.detailTabs.execHelper = function(helperName) {
  return Template[template][helperName]();
};

Template.detailTabs.renderTabTemplate = function() {
  return Template[this.template](this.data);
};

var container, containerWidth, tabsWidth;
var hasTabSroll = false;
var resizeDep = new Deps.Dependency;

var checkScroll = function() {
  containerWidth = container.width();
  tabsWidth = container.children().width();
  hasTabSroll = container.get(0).scrollWidth > container.width();
  resizeDep.changed();
};

Template.detailTabs.rendered = function() {
  container = $('.details-tabs-container');
  checkScroll();

  container.resize(function(){
    checkScroll();
  });
};

Template.detailTabs.isActive = function(name){
  selectedTabDep.depend();
  return (name == selectedTab.id) ? 'active' : '';
};

Template.detailTabs.currentTemplate = function() {
  selectedTabDep.depend();
  return selectedTab.template;
};

Template.detailTabs.tabs = function() {
  Session.keyDeps.entityId.depend(); // Update tabs when entityId changes
  return this.tabs;
};

Template.detailTabs.showMoveButtons = function() {
  resizeDep.depend();
  return hasTabSroll? '': 'hide';
};

var currentOffset = 0;
var moveOffset = 200;
Template.detailTabs.events = {
  'click #next-tab': function() {
    if (containerWidth + currentOffset <= tabsWidth) {
      currentOffset += moveOffset;
      $('.details-tabs').stop().animate({
        left: "-=" + moveOffset + 'px'
      }, 100);
    }
  },
  'click #back-tab': function() {
    if (currentOffset - moveOffset >= 0) {
      currentOffset -= moveOffset;
      $('.details-tabs').stop().animate({
        left: "+=" + moveOffset + 'px'
      }, 100);
    }
  },
  'click .details-tab': function() {
    selectedTab = _.findWhere(UI._parentData(0).tabs, {id: this.id});
    selectedTabDep.changed();
  }
};
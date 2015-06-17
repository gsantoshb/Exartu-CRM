Utils.adminSettings = {};
SubscriptionHandlers = {};
Utils.reactiveProp(Utils.adminSettings, 'isClientAdmin', false);
Utils.reactiveProp(Utils.adminSettings, 'isSystemAdmin', false);
Utils.reactiveProp(Utils.adminSettings, 'isAdmin', function () {
    return Utils.adminSettings.isClientAdmin || Utils.adminSettings.isSystemAdmin;
});
Utils.reactiveProp(Utils.adminSettings, 'isSysAdmin', function () {
    return Utils.adminSettings.isSystemAdmin;
});

var currentLanguageLabel = new ReactiveVar();
var searchStringEntries = "";
var searchStringEntriesDep = new Deps.Dependency();
var sortEntries = new ReactiveVar(-1);

Meteor.call('bUserIsClientAdmin', null, function (err, result) {
    if (err)
        return console.log(err);
    Utils.adminSettings.isClientAdmin = result;
});
Meteor.call('bUserIsSystemAdmin', null, function (err, result) {
    if (err)
        return console.log(err);
    Utils.adminSettings.isSystemAdmin = result;
});
Template.header.created = function() {
  Meteor.autorun(function (){
    searchStringEntriesDep.depend();
      SubscriptionHandlers.LastEntriesHandler = Meteor.subscribe('lastEntries', searchStringEntries,sortEntries.get());

  }
)
}

Template.header.helpers({
    isAdmin: function () {
        return Utils.adminSettings.isAdmin();
    },
    isSysAdmin: function () {
        return Utils.adminSettings.isSysAdmin();
    },
    userThumbnail: function () {
        var user = Meteor.user();
        if (user.profilePictureId) {
            return UsersFS.getThumbnailUrlForBlaze(user.profilePictureId)
        }
        if (user.services && user.services.google && user.services.google.picture) {
            return user.services.google.picture;
        }
        return '/assets/user-photo-placeholder.jpg';
    },
    user: function () {
        return Meteor.user();
    },
    userName: function () {
        return Meteor.user().username;
    },
    userEmail: function () {
        return Meteor.user().emails[0].address;
    },
    UnreadMessagesCount: function () {
        console.log('unreadmess');
        return Messages.find({
            read: false,
            destination: Meteor.userId()
        }, {
            sort: {
                dateCreated: 1
            }
        }).count();
    },
    latestUnreadMessages: function () {
        return Messages.find({
            read: false,
            destination: Meteor.userId()
        }, {
            sort: {
                dateCreated: 1
            },
            limit: 4
        });
    },
    userInfo: function (msg) {
        return Utils.getUserInformation(msg.from);
    },
    conversationURL: function (msg) {
        return '/inbox/' + msg.conversationId;
    },
    hierInfo: function () {
        return Hierarchies.findOne({_id: Meteor.user().hierId});
    },
    isFree: function (planCode) {
        return planCode == SubscriptionPlan.plansEnum.free;
    },
    currentHierName: function () {
        var hier = Meteor.user() ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;
        return hier ? hier.name : '';
    },
    currentLanguageLabel: function() {
        var user = Meteor.users.findOne({_id: Meteor.userId()});
        switch (user.language) {
		case 'es':
			return 'Español';
		case 'cn':
			return '简体中文';
		default:
			return 'English';
        }
		
    },
    latestHiers: function () {
      var res = [];
      if(Meteor.user().latestHiers) {
        _.each(Meteor.user().latestHiers, function (hierId) {
          res.push(Hierarchies.findOne({_id: hierId}));
        });
      }
      return res;
    },
    latestHiersCount: function () {
        return Hierarchies.find({_id: {$in: Meteor.user().latestHiers || []}}).count();
    }
});
Template.header.events({
    'click #signout': function () {
        Meteor.logout(function () {
            Router.go('/login');
        });
    },
    'click #menu-settings > a[data-target="#menu-settings"]': function(e, ctx) {
        $('#menu-settings .sub-menu').hide();
    },
    'click .dropdown-menu > li > a.trigger': function(e, ctx){
        var current = $(e.currentTarget).next();
        var grandparent = $(e.currentTarget).parent().parent();

        if( $(e.currentTarget).hasClass('left-caret') || $(e.currentTarget).hasClass('right-caret') )
            $(e.currentTarget).toggleClass('right-caret left-caret');

        grandparent.find('.left-caret').not(e.currentTarget).toggleClass('right-caret left-caret');
        grandparent.find(".sub-menu:visible").not(current).hide();

        current.toggle();
        e.stopPropagation();
    },
    'click .dropdown-menu > li > a:not(.trigger)': function(e, ctx){
        var root = $(e.currentTarget).closest('.dropdown');
        root.find('.left-caret').toggleClass('right-caret left-caret');
        root.find('.sub-menu:visible').hide();
    },
    'click .changeHier': function () {
      Meteor.call('changeCurrentHierId', this._id, function (err, result) {
        if (err)
          console.error(err);
        else {
          Meteor.disconnect();
          Meteor.reconnect();
        }
      })
    },
    'click #search-entry': function(e){
      e.stopPropagation();
    },
    'keyup #search-entry': function(e){
      searchStringEntries = e.target.value;
      searchStringEntriesDep.changed();
    },
    'click #sort-Entries': function(e){
      sortEntries.set(sortEntries.get()*-1);
      e.stopPropagation();
    }
});

var init = true;
Template.header.rendered = function () {
    $('body').addClass("flat");
    $('body').attr('data-color', 'dark');
    $('#color-style a[data-color=dark]').addClass('active');

    if (init) {
        //=== Tooltips ===
        $('.tip').tooltip();
        $('.tip-left').tooltip({
            placement: 'left'
        });
        $('.tip-right').tooltip({
            placement: 'right'
        });
        $('.tip-top').tooltip({
            placement: 'top'
        });
        $('.tip-bottom').tooltip({
            placement: 'bottom'
        });

        var submenuLogic = function (e) {
            var submenu = $(this).siblings('ul');
            var li = $(this).parents('li');
            var trigger = $(this).parents('#menu-trigger');
            var hideIfClickOutside = function (e) {
                if (!submenu.is(e.target) && submenu.has(e.target).length === 0
                    && !li.is(e.target) && li.has(e.target).length === 0) {
                    submenu.slideUp();
                    li.removeClass('open');
                    $('#sidebar').off('click', hideIfClickOutside);
                }
            }
            if ($(window).width() > 480) {
                var submenus = $('#sidebar li.submenu ul');
                var submenus_parents = $('#sidebar li.submenu');
            } else {
                var submenus = $('#jPanelMenu-menu li.submenu ul');
                var submenus_parents = $('#jPanelMenu-menu li.submenu');
            }

            if (li.hasClass('open')) {
                if (($(window).width() > 768) || ($(window).width() <= 480)) {
                    submenu.slideUp();
                } else {
                    submenu.fadeOut(75);
                }
                li.removeClass('open');
            } else {
                if (($(window).width() > 768) || ($(window).width() <= 480)) {
                    submenus.slideUp();
                    submenu.slideDown();
                    $('#sidebar').on('click', hideIfClickOutside);

                } else {
                    submenus.fadeOut(75);
                    submenu.fadeIn(75);
                }
                submenus_parents.removeClass('open');
                li.addClass('open');
            }
//                        $('html').getNiceScroll().resize();
        };

        $('.submenu > .trigger-menu').on('click', submenuLogic);

        //Theme Switcher
        switcherBtn = $('#switcher-button');
        switcherPanel = $('#switcher-inner');

        switcherBtn.click(function () {
            if (switcherPanel.hasClass('open')) {
                switcherPanel.hide(75);
                switcherPanel.removeClass('open');
            } else {
                switcherPanel.show(75);
                switcherPanel.addClass('open');
            }
        });

        $('#color-style a').click(function () {
            var color = $(this).attr('data-color');
            $(this).parent().find('a').removeClass('active');
            $(this).addClass('active');
            $('body').attr('data-color', color);
            return false;
        });

        if ($('body').hasClass('flat')) {
            $('#layout-type a[data-option="flat"]').addClass('active');
        } else {
            $('#layout-type a[data-option="old"]').addClass('active');
        }
        $('#layout-type a').click(function () {
            var type = $(this).attr('data-option');
            if (type == 'flat') {
                $('body').addClass('flat');
            } else {
                $('body').removeClass('flat');
            }
            $(this).parent().find('a').removeClass('active');
            $(this).addClass('active');
        });
        init = false;
    }
};

Template.header.destroyed = function () {
    $('body').removeAttr('data-color');
};


Template.sidebar.rendered = function () {
    var sidebar = $('#sidebar'),
        body = $('body'),
        trigger = $('#menu-trigger'),
        isOpen = false;

    var minimunWidth = 768;

    var hideIfClickOutside = function (e) {

        var submenuTrigger = $('.submenu>a');

        var isInMenuTrigger = submenuTrigger.is(e.target) || submenuTrigger.has(e.target).length > 0;
        var isInTrigger = trigger.is(e.target) || trigger.has(e.target).length > 0;
        if (!isInMenuTrigger && !isInTrigger) {
            hide();
            body.off('click', hideIfClickOutside);
        }
    }
    var hide = function () {
        body.removeClass('in');
        body.addClass('animating');
        sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function () {
            body.removeClass('animating');
        });

        sidebar.removeClass('in');
        sidebar.addClass('animating');
        sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function () {
            sidebar.removeClass('animating');
        });
        body.off('click', hideIfClickOutside);
        isOpen = false;
    }
    var show = function () {
        sidebar.show();

        body.addClass('in');
        body.addClass('animating');
        sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function () {
            body.removeClass('animating');
        });


        sidebar.addClass('in');
        sidebar.addClass('animating');
        sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function () {
            sidebar.removeClass('animating');
        });
        isOpen = true;
    }
    var start = function () {
        isOpen = false;
        trigger.unbind("click");
        trigger.click(function () {
            if (isOpen) {
                hide();
            } else {
                show();
                body.click(hideIfClickOutside);
            }
        })
    }
    var stop = function () {
        sidebar.removeClass('in');
        body.removeClass('in');
        body.off('click', hideIfClickOutside);
        trigger.unbind("click");
    };

    if ($(window).width() < minimunWidth) {
        start();
    }
    $(window).resize(_.debounce(function () {
        if ($(window).width() < minimunWidth) {
            start();
        } else {
            stop();
        }
    }, 400));
  //this.$('#pingeds').sortable({
  //  stop: function(e, ui) {
  //    // get the dragged html element and the one before
  //    //   and after it
  //    var el = ui.item.get(0);
  //    var before = ui.item.prev().get(0);
  //    var after = ui.item.next().get(0);
  //    if(before) {
  //      Meteor.call("updateIndex", el.id, before.id, function () {
  //
  //      })
  //    }
  //    else{
  //      Meteor.call("updateIndex", el.id,undefined, function () {
  //
  //      })
  //    }
  //
  //  }
  //})


}
Template.sidebar.helpers({
    isAdmin: function () {
        return Utils.adminSettings.isAdmin();
    },
    contactableTypes: function () {
        return dType.ObjTypes.find({parent: Enums.objGroupType.contactable});
    },
    jobObjTypes: function () {
        return dType.ObjTypes.find({
            parent: Enums.objGroupType.job
        });
    },
    getActiveClass: function (route, type) {
        var current = Router.current();
        if (!current) return '';

        var currentType = current.params.type;
        var currentRoute = current.route.getName();
        if (currentRoute == route && (type == currentType)) {
            return 'active'
        }
        return ''
    },
    lastEntryNotPinged: function(){
      return LastEntries.find({pinged:false},{sort:{dateCreated:sortEntries.get()}})
    },
    lastEntryPinged: function(){
      return LastEntries.find({pinged:true},{sort:{index:1}})
    },
    inverseCrono: function(){
      return sortEntries.get() === 1;
    }

});

Template.lastEntryItem.helpers({
  isContactable:function(){
    return this.type === Enums.linkTypes.contactable.value;
  },
  isJob: function(){
    return this.type === Enums.linkTypes.job.value;
  },
  isHotList: function(){
    return this.type === Enums.linkTypes.hotList.value;
  },
  isPlacement:function(){
    return this.type === Enums.linkTypes.placement.value;
  },
  link:function(){
    switch(this.type){
      case Enums.linkTypes.contactable.value:{
        return "/contactable/"+this.entity;
        break;
      }
      case Enums.linkTypes.job.value:{
        return "/job/"+this.entity;
        break;
      }
      case Enums.linkTypes.hotList.value:{
        return "/hotList/"+this.entity;
        break;
      }
      case Enums.linkTypes.placement.value:{
        return "/placement/"+this.entity;
        break;
      }
    }
  },
  isPinged: function(){
    return this.pinged;
  }
})

Template.lastEntryItem.events({
  "click #remove-entry":function(e){
    Meteor.call("removeEntry",this._id,function(err,res){

    })
  },
  "click #ping-entry": function(e){
    Meteor.call("changePing",this._id,function(err,res){

    })
  }

})



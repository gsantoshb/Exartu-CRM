Template.header.helpers({
    userThumbnail: function(){
        var user=Meteor.user()
        if (user.profilePictureId){
            return UsersFS.getThumbnailUrlForBlaze(user.profilePictureId)
        }
        if (user.services && user.services.google && user.services.google.picture){
            return  user.services.google.picture;
        }
        return '/assets/user-photo-placeholder.jpg';
    },
    userName: function(){
        return Meteor.user().username;
    },
    userEmail: function(){
      return Meteor.user().emails[0].address;
    },
    UnreadMessagesCount: function(){
        return Messages.find({
            read: false,
            destination: Meteor.userId()
        }, {
            sort: {
                dateCreated: 1
            }
        }).count();
    },
    latestUnreadMessages: function(){
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
    userInfo:function(msg){
        return Utils.getUserInformation(msg.from);
    },
    conversationURL: function(msg){
        return '/inbox/' + msg.conversationId;
    },
    hierInfo: function() {
      return Hierarchies.findOne({_id: Meteor.user().hierId});
    },
    isFree: function(planCode) {
      return planCode == SubscriptionPlan.plansEnum.free;
    },
    currentHierName: function(){
      var hier = Meteor.user() ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;
      return hier ? hier.name : '';
    }
});
Template.header.events({
    'click #signout': function(){
        Meteor.logout(function(){
            Router.go('/login');
        });
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
            var hideIfClickOutside=function(e){
              if (! submenu.is(e.target) && submenu.has(e.target).length === 0
              && ! li.is(e.target) && li.has(e.target).length === 0  ) {
                submenu.slideUp();
                li.removeClass('open');
                $('#sidebar').off('click',hideIfClickOutside);
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
                    submenu.fadeOut(250);
                }
                li.removeClass('open');
            } else {
                if (($(window).width() > 768) || ($(window).width() <= 480)) {
                    submenus.slideUp();
                    submenu.slideDown();
                  $('#sidebar').on('click',hideIfClickOutside);

                } else {
                    submenus.fadeOut(250);
                    submenu.fadeIn(250);
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
                switcherPanel.hide(300);
                switcherPanel.removeClass('open');
            } else {
                switcherPanel.show(300);
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
}

Template.sidebar.rendered=function(){
  var sidebar=$('#sidebar'),
    body=$('body'),
    trigger=$('#menu-trigger'),
    isOpen=false;

  var minimunWidth=768;

  var hideIfClickOutside=function(e){
    var submenuTrigger= $('.submenu>a');

    var isInMenuTrigger = submenuTrigger.is(e.target) || submenuTrigger.has(e.target).length > 0;
    var isInTrigger = trigger.is(e.target) || trigger.has(e.target).length > 0;
    if (! isInMenuTrigger && ! isInTrigger) {
      hide();
      body.off('click',hideIfClickOutside);
    }
  }
  var hide=function(){
    body.removeClass('in');
    body.addClass('animating');
    sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
      body.removeClass('animating');
    });

    sidebar.removeClass('in');
    sidebar.addClass('animating');
    sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
      sidebar.removeClass('animating');
    });
    body.off('click',hideIfClickOutside);
    isOpen=false;
  }
  var show=function(){
    sidebar.show();

    body.addClass('in');
    body.addClass('animating');
    sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
      body.removeClass('animating');
    });


    sidebar.addClass('in');
    sidebar.addClass('animating');
    sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
      sidebar.removeClass('animating');
    });
    isOpen=true;
  }
  var start=function(){
    isOpen=false;
    trigger.unbind( "click" );
    trigger.click(function(){
      if(isOpen){
        hide();
      } else {
        show();
        body.click(hideIfClickOutside);
      }
    })
  }
  var stop = function(){
    sidebar.removeClass('in');
    body.removeClass('in');
    body.off('click', hideIfClickOutside);
    trigger.unbind( "click" );
  };

  if ($(window).width() < minimunWidth){
    start();
  }
  $(window).resize(_.debounce(function(){
    if ($(window).width() < minimunWidth){
      start();
    }else{
      stop();
    }
  },400));

}
Template.sidebar.helpers({
  contactableTypes: function () {
    return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
  },
  jobObjTypes: function() {
    return dType.ObjTypes.find({
      parent: Enums.objGroupType.job
    });
  },
  getActiveClass: function(route, type){
    var current= Router.current();
    if (!current) return '';

    var currentType = current.params.type;
    var currentRoute = current.route.name;

    if (currentRoute == route && (type == currentType)){
      return 'active'
    }
    return ''
  }

});



Template.header.waitOn = ['UsersHandler']
Template.header.viewModel = function () {
  var self = this;

  self.filesCollection = UsersFS;

  self.unreadMessages = ko.meteor.find(Messages, {
    read: false,
    destination: Meteor.userId()
  }, {
    sort: {
      createdAt: 1
    },
  });

  self.latestUnreadMessages = ko.computed(function () {
    return self.unreadMessages.slice(0, 4);
  });

  self.showSales = true; // ko.observable(Meteor.user().permissions.indexOf(Enums.permissionFunction.Sales) >= 0);
    self.contactableObjTypes = ko.meteor.find(dType.ObjTypes, {
        parent: Enums.objGroupType.contactable
  });

    self.jobObjTypes = ko.meteor.find(dType.ObjTypes, {
        parent: Enums.objGroupType.job
  });

  self.picture = function (size) {
    return Meteor.user().services.google.picture.split('?')[0] + '?sz=' + size;
  }
  self.activeRoute = ko.dep(function () {
    return Router.current().route.name;
  });
  self.activeRouteType = ko.dep(function () {
    return Router.current().params.type;
  });
  return self;
};

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

            var hideIfClickOutside=function(e){
                if (!submenu.is(e.target) && submenu.has(e.target).length === 0
                    && !li.is(e.target) && li.has(e.target).length === 0) {
                    submenu.slideUp();
                    li.removeClass('open');
                    $('body').off('click',hideIfClickOutside);
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
                    $('body').on('click',hideIfClickOutside);

        } else {
          submenus.fadeOut(250);
          submenu.fadeIn(250);
        }
        submenus_parents.removeClass('open');
        li.addClass('open');
      }
//                        $('html').getNiceScroll().resize();
    };

    $('.submenu > a').on('click', submenuLogic);

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

Template.header.hasPicture = function () {
  var user = Meteor.user();
  return user && user.services && user.services.google && user.services.google.picture;
}
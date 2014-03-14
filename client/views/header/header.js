Template.header.waitOn = ['UsersHandler', 'UsersFSHandler']
Template.header.viewModel = function () {
    var self = this;

    self.unreadMessages = ko.meteor.find(Messages, {
        readed: false,
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
    self.contactableObjTypes = ko.meteor.find(ObjTypes, {
        objGroupType: Enums.objGroupType.contactable
    });

    self.jobObjTypes = ko.meteor.find(ObjTypes, {
        objGroupType: Enums.objGroupType.job
    });

    self.picture = function (size) {
        return Meteor.user().services.google.picture.split('?')[0] + '?sz=' + size;
    }

    return self;
};

var init = true;
Template.header.rendered = function () {
//    $('body').attr('data-color', 'enterprise-dark');
    $('body').addClass("flat");

    if (init) {
//        var ul = $('#sidebar > ul');
//        var ul2 = $('#sidebar li.open ul');
        //     === jPanelMenu === //
//        var jPM = $.jPanelMenu({
//            menu: '#sidebar',
//            trigger: '#menu-trigger'
//        });
//        jPM.off();
        //        $("html").niceScroll({
        //            hideraildelay: 1,
        //            zindex: 9999,
        //            horizrailenabled: false
        //        });

        // === Resize window related === //
//        $(window).resize(function () {
//            if ($(window).width() > 480 && $(window).width() < 769) {
//
//                ul2.css({
//                    'display': 'none'
//                });
//                ul.css({
//                    'display': 'block'
//                });
//            }

//            if ($(window).width() <= 480) {
//
////                ul.css({
////                    'display': 'none'
////                });
////                ul2.css({
////                    'display': 'block'
////                });
////                if (!$('html').hasClass('jPanelMenu')) {
////                    jPM.on();
////                    //                    $('#jPanelMenu-menu').niceScroll();
////                    //                    $('#jPanelMenu-menu').getNiceScroll().resize();
////                }
//
//                if ($(window).scrollTop() > 35) {
//                    $('body').addClass('fixed');
//                }
//                $(window).scroll(function () {
//                    if ($(window).scrollTop() > 35) {
//                        $('body').addClass('fixed');
//                    } else {
//                        $('body').removeClass('fixed');
//                    }
//                });
//            } else {
//                jPM.off();
//            }
//            if ($(window).width() > 768) {
//
//                ul.css({
//                    'display': 'block'
//                });
//                ul2.css({
//                    'display': 'block'
//                });
//                $('#user-nav > ul').css({
//                    width: 'auto',
//                    margin: '0'
//                });
//            }
            //            $('html').getNiceScroll().resize();
//        });


//        if ($(window).width() <= 480) {
//
//            setTimeout(function () {
//                ul.css({
//                    'display': 'none'
//                });
//                ul2.css({
//                    'display': 'block'
//                });
//                if (!$('html').hasClass('jPanelMenu')) {
//                    jPM.on();
                    //                    $('#jPanelMenu-menu').niceScroll();
                    //                    $('#jPanelMenu-menu').getNiceScroll().resize();
//                }

//                if ($(window).scrollTop() > 35) {
//                    $('body').addClass('fixed');
//                }
//                $(window).scroll(function () {
//                    if ($(window).scrollTop() > 35) {
//                        $('body').addClass('fixed');
//                    } else {
//                        $('body').removeClass('fixed');
//                    }
//                });
//            }, 3000);
//        }

//        if ($(window).width() > 480) {
//            ul.css({
//                'display': 'block'
//            });
////            jPM.off();
//        }
//        if ($(window).width() > 480 && $(window).width() < 769) {
//            ul2.css({
//                'display': 'none'
//            });
//        }

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
        $('body').attr('data-color', 'enterprise-dark');
        $('#color-style a[data-color=enterprise-dark]').addClass('active');

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

Template.header.events = {
    'click #dashboardNav': function () {
        // Remove class from previous navigation link
        $('#sidebar > ul > li.active').removeClass('active');
        // Add class
        $('#dashboardNav').addClass('active');
    },
    'click #contactablesNav': function () {
        // Remove class from previous navigation link
        $('#sidebar > ul > li.active').removeClass('active');
        // Add class
        $('#contactablesNav').addClass('active');
    },
    'click #jobsNav': function () {
        // Remove class from previous navigation link
        $('#sidebar > ul > li.active').removeClass('active');
        // Add class
        $('#jobsNav').addClass('active');
    }
}
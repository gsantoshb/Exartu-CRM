Template.header.rendered = function () {
	switch (Router.current().route.name) {
	case 'dashboard':
		$('#dashboardLink').addClass("active");
		break;
	case 'contactables':
		$('#contactablesLink').addClass("active");
		break;
	};
}

Template.header.events = {
	'click #dashboardLink': function () {
		// Remove class from previus navegation link
		$('.ats-navItem .active').removeClass('active');
		// Add class
		$('#dashboardLink').addClass('active');
	},
	'click #contactablesLink': function () {
		// Remove class from previus navegation link
		$('.ats-navItem .active').removeClass('active');
		// Add class
		$('#contactablesLink').addClass('active');
	}
}
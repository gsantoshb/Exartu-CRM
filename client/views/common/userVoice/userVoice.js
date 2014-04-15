Template.userVoice.viewModel = function() {
  var self = this;

  (function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/wHbhXqX9bzeBo1u9Rgsn7g.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})()

  UserVoice = window.UserVoice || [];
  self.showClassicWidget = function() {
    UserVoice.push(['showLightbox', 'classic_widget', {
      mode: 'full',
      primary_color: '#cc6d00',
      link_color: '#007dbf',
      default_mode: 'support',
      forum_id: 248698
    }]);
  }
}
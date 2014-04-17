Template.userVoice.rendered = function() {
  // UserVoice
  UserVoice = window.UserVoice || [];
  $('#user-voice').on('click', function() {
    UserVoice.push(['showLightbox', 'classic_widget', {
      mode: 'full',
      primary_color: '#cc6d00',
      link_color: '#007dbf',
      default_mode: 'support',
      forum_id: 248698
    }]);
  });
};
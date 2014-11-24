Package.describe({
    summary: "bootstrap3 wysiwyg HTML5 editor"
});

Package.on_use(function (api) {
    api.use(['jquery'], 'client');
	api.add_files('lib/bootstrap-wysihtml5.css', 'client'); 
	api.add_files('lib/wysihtml5-0.3.0.js', 'client', {bare:true});
	api.add_files('lib/bootstrap3-wysiwyg5-color.css', 'client');
	api.add_files('lib/bootstrap3-wysihtml5.js', 'client', {bare:true});
	api.export('wysihtml5');
});

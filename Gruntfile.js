module.exports = function(grunt) {
    var packageJson = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: packageJson,
        jade: {
            compile: {
                options: {
                    data: { debug: false, title: 'Serenedi jade files' },
                    pretty: true
                },
                files: [ { 
                  expand: true, 
                  src: "*.jade", 
                  dest: "public/pages/", 
                  cwd: "views/", 
                  ext: '.html'
                } ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jade');

    grunt.registerTask('default', ['jade']);
};

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
        },
        jshint: {
          options: {
            undef: true, // check for usage of undefined variables
            '-W033': true, // ignore Missing semicolon
            '-W099': true, // ignore Mixed spaces and tabs
            '-W041': true, // ignore Use '===' to compare with '0'
            '-W065': true, // ignore Missing radix parameter
            '-W069': true, // ignore ['HEAD'] is better written in dot notation        
          },
          web: {
            options: {
              node: true,
              browser: true,
              globals: {
                'io': true,
                'google': true,
                'FB': true
              }
            },
            src: ['public/js/main.js']
          },
          node: {
            options: {
              node: true
            },
            src: [
              'Gruntfile.js',
              'bin/*',
              'serenedi.js',
            ]
          }
        },
        browserify: {
          dist: {
            files: {
              'public/serenedi.js': ['public/js/main.js']
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jade', 'jshint', 'browserify']);
};

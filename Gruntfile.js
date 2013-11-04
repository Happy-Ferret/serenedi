var path = require('path');

module.exports = function(grunt) {
    var packageJson = grunt.file.readJSON('package.json');
    var properties = grunt.file.readJSON(path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.serenedirc'));
    grunt.initConfig({
        pkg: packageJson,
        jade: {
            compile: {
                options: {
                    data: { googleAPIKey: properties.googleAPIKey},
                    pretty: false
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
        less: {
          production: {
            files: {
              "public/styles.css": ['public/css/d1rtb2g-0.1.css', 'public/css/jquery.mCustomScrollbar.css', 
                            'public/css/bootstrap.css', 'public/css/Serenedi-Theme/jquery-ui-1.10.3.serenedi.min.css']
            }
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


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jade', 'jshint', 'browserify', 'less']);
};

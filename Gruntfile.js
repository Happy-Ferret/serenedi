var path = require('path');
var fs = require('fs');
var phantomjs = require('phantomjs');
var childProcess = require('child_process');

module.exports = function(grunt) {
  var packageJson = grunt.file.readJSON('package.json');
  var properties = grunt.file.readJSON('.serenedirc');
  grunt.initConfig({
      pkg: packageJson,
      jade: {
          compile: {
              options: {
                  data: { googleAPIKey: properties.googleAPIKey, url: properties.url },
                  pretty: false
              },
              files: [ { 
                expand: true, 
                src: ["*.jade"], 
                dest: "public/template", 
                cwd: "views/", 
                ext: '.html'
              } ]
          }
      },
      jshint: {
        options: {
          undef: true, // check for usage of undefined variables
          '-W069': true, // ignore ['HEAD'] is better written in dot notation        
          '-W079': true
        },
        web: {
          options: {
            node: true,
            browser: true,
            globals: {
              'io': true,
              'google': true,
              'FB': true,
              'can': true
            }
          },
          src: ['public/js/main.js', 'public/js/source/*', './*.js', 'source/*.js']
        },
        node: {
          options: {
            node: true
          },
          src: [
            'source/*.js',
            './*.js',
          ]
        },
        phantomjs: {
          options: {
            phantom: true,
            browser: true,
            globals: {
              '$': true,
            }
          },
          src: ['clicktests/**/*.js']
        },
        mocha: {
          options: {
            node: true,
            globals: {
              'it': true,
              'describe': true,
              'before': true,
              'after': true,
              'window': true,
              'document': true,
              'navigator': true
            }
          } 
        }
      },
      less: {
        production: {
          files: {
            "public/styles.css": ['public/css/styles.css', 'public/css/jquery.mCustomScrollbar.css', 'public/css/Serenedi-Theme/jquery-ui-1.10.3.serenedi.min.css']
          }
        }
      },
      browserify: {
        dist: {
          files: {
            'public/main.js': ['public/js/main.js']
          }
        }
      },
      templates: {
        files: ['public/*.html'],
        tasks: ['templates'],
        options: {
          spawn: false,
        },
      },
      clean: ["public/template", "public/fonts", "public/jquery.min.map", "public/*.css", "public/*.js"],
      copy: {
        main: {
          files: [
            // includes files within path and its sub-directories
            {expand: true, flatten: true, filter: 'isFile', src: 'bower_components/bootstrap/dist/fonts/*', dest: 'public/fonts/'},
            {expand: true, flatten: true, src: 'bower_components/jquery/jquery.min.map', dest: 'public/'}
          ]
        }
      },
      simplemocha: {
        options: {
          reporter: 'spec'
        },

        all: { src: 'test/*.js' }
      }
  });

  var templateIncludeRegexp = /<!-- serenedi-import-[a-z]*Template: "([^"^.])*.html"-->/gm;
  grunt.registerTask('templates', 'Compiling templates', function() {
    function compileTemplate(inFilename, outFilename) {
      var template = fs.readFileSync(inFilename, 'utf8');
      var newTemplate = template.replace(templateIncludeRegexp, function(match) {
        var templateName = match.split("\"")[1];
        console.log('Replacing:  ' + templateName);
        var res = fs.readFileSync(path.join(path.dirname(inFilename), templateName), 'utf8');

        if(match.indexOf('mustache') > 0) {
          res = '<script type="text/mustache" id="' + templateName.substring(0, templateName.length - 5) + '">' + res + '</script>';
        }

        return res;
      });
      fs.writeFileSync(outFilename, newTemplate);
    }
    compileTemplate('public/template/index.html', 'public/index.html');
  });

  grunt.registerTask('clicktest', 'Run clicktests.', function() {
    var done = this.async();
    grunt.log.writeln('Running clicktests...');
    var child = childProcess.execFile(phantomjs.path, [path.join(__dirname, 'clicktests', 'clicktests.js')]);
    child.stdout.on('data', function(data) {
      grunt.log.write(data);
    });
    child.stderr.on('data', function(data) {
      grunt.log.error(data);
    });
    child.on('exit', function(code) {
      done(code === 0);
    });
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('unittest', ['simplemocha']);
  grunt.registerTask('test', ['unittest', 'clicktest']);

  grunt.registerTask('default', ['clean', 'copy', 'jade', 'browserify', 'less', 'jshint', 'templates', ]);
};

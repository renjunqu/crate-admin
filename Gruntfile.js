'use strict';

module.exports = function(grunt) {
  var serveStatic = require('serve-static');
  // load all grunt tasks
  var matchDep = require('matchdep');
  matchDep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var bower = require('./bower.json');
  var pkg = require('./package.json');

  var crateConf = {
    version: bower.version,
    app: bower.appPath || 'app',
    dist: 'dist',
    tmp: '.tmp'
  };

  grunt.initConfig({
    crate: crateConf,
    watch: {
      options: {
        livereload: true
      },
      less: {
        files: ['<%= crate.app %>/styles/{,*/}*.less'],
        tasks: ['less:dist']
      },
      i18n: {
        files: ['<%= crate.app %>/i18n/**'],
        tasks: ['copy:i18nTmp']
      }
    },
    connect: {
      options: {
        port: 9000,
        path: '/'
      },
      dev: {
        options: {
          base: '<%= crate.app %>',
          middleware: function() {
            return [
              serveStatic(crateConf.tmp),
              serveStatic(crateConf.app)
            ];
          }
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= crate.tmp %>',
            '<%= crate.dist %>'
          ]
        }]
      },
      components: {
        files: [{
          src: [
            '<%= crate.dist %>/bower_components',
            '!<%= crate.dist %>/bower_components/font-awesome/fonts'
          ]
        }]
      },
      server: '<%= crate.tmp %>'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= crate.app %>/scripts/{,*/}*.js',
      ]
    },
    less: {
      dist: {
        options: {
          compile: true
        },
        files: [{
          expand: true,
          cwd: '<%= crate.app %>/styles',
          src: 'main.less',
          dest: '<%= crate.tmp %>/styles/',
          ext: '.css'
        }]
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= crate.dist %>/scripts/{,*/}*.js',
            '<%= crate.dist %>/styles/{,*/}*.css',
            '<%= crate.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= crate.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= crate.app %>/index.html',
      options: {
        dest: '<%= crate.dist %>'
      }
    },
    usemin: {
      html: ['<%= crate.dist %>/{,*/}*.html'],
      css: ['<%= crate.dist %>/styles/{,*/}*.css'],
      js: '<%= crate.dist %>/scripts/{,*/}*js',
      options: {
        assetDirs: [
          '<%= crate.dist %>',
          '<%= crate.dist %>/images'
        ],
        patterns: {
          js: [
            [
              /(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm,
              'Update the JS to reference our revved images'
            ]
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= crate.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= crate.dist %>/images'
        }]
      }
    },
    cssmin: {},
    htmlmin: {
      dist: {
        options: {
          removeComments: false
        },
        files: [{
          expand: true,
          cwd: '<%= crate.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= crate.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= crate.app %>',
          dest: '<%= crate.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/{,*/}*.{gif,webp,svg}',
            'fonts/**',
            'plugins/**',
            'conf/**',
            'i18n/**'
          ]
        }, {
          expand: true,
          cwd: '<%= crate.app %>',
          dest: '<%= crate.dist %>/fonts',
          src: [
            'bower_components/font-awesome/fonts/*',
            'bower_components/bootstrap/dist/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '<%= crate.tmp %>/images',
          dest: '<%= crate.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      i18nTmp: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= crate.app %>',
          dest: '<%= crate.tmp %>',
          src: [
            'i18n/**'
          ]
        }]
      },
    },
    concurrent: {
      server: [
        'less'
      ],
      dist: [
        'less',
        'imagemin',
        'htmlmin'
      ]
    },
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= crate.dist %>/scripts',
          src: '*.js',
          dest: '<%= crate.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= crate.dist %>/scripts/scripts.js': [
            '<%= crate.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    'string-replace': {
      dist: {
        files: {
          '<%= crate.dist %>/styles/': '<%= crate.dist %>/styles/*.css'
        },
        options: {
          replacements: [{
            pattern: /\.{2}\/(bower_components\/font-awesome\/fonts)/ig,
            replacement: '../fonts/$1'
          }, {
            pattern: /\.{2}\/(bower_components\/bootstrap\/dist\/fonts)/ig,
            replacement: '../fonts/$1'
          }]
        }
      }
    },
    karma: {
      options: {
        frameworks: ['jasmine'],
        logLevel: 'ERROR',
        singleRun: true,
        reporters: ['mocha'],
        files: [
          'app/bower_components/jquery/dist/jquery.js',
          'app/bower_components/angular/angular.js',
          'app/bower_components/angular-mocks/angular-mocks.js',
          'app/bower_components/angular-cookies/angular-cookies.js',
          'app/bower_components/angular-route/angular-route.js',
          'app/bower_components/angular-sanitize/angular-sanitize.js',
          'app/bower_components/angular-translate/angular-translate.js',
          'app/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
          'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
          'app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
          'app/bower_components/angular-truncate-2/dist/angular-truncate-2.js',
          'app/bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
          'app/scripts/app.js',
          'app/scripts/**/*.js',
          'app/plugins/**/*.js',
          'app/tests/**/*.js',
          'app/conf/plugins.json',
        ]
      },
      all_tests: {
        browsers: ['PhantomJS']
      },
    }
  });

  grunt.registerTask('build', function(target) {
    if (bower.version != pkg.version) {
      throw new Error("Version numbers in bower.json and package.json do not match!");
    }
    grunt.task.run([
      'clean:dist',
      'useminPrepare',
      'concurrent:dist',
      'concat',
      'copy:dist',
      'ngAnnotate',
      'cssmin',
      'uglify',
      'rev',
      'usemin',
      'string-replace:dist',
      'clean:components'
    ]);
  });

  grunt.registerTask('server', [
    'concurrent:server',
    'copy:i18nTmp',
    'connect:dev',
    'watch'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);

  grunt.registerTask('test', [
    'karma:all_tests'
  ]);

};

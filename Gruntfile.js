module.exports = function(grunt) {

  function loadFrom(path, config) {
    var glob = require('glob'),
    object = {};

    glob.sync('*', {cwd: path}).forEach(function(option) {
      var key = option.replace(/\.js$/,'');
      config[key] = require(path + option);
    });
  }

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    env: process.env,
    clean: ['tmp']
  };

  loadFrom('./tasks/options/', config);

  grunt.initConfig(config);

  require('matchdep')
  .filterDev('grunt-*')
  .filter(function(name){ return name !== 'grunt-cli'; })
  .forEach(grunt.loadNpmTasks);

  grunt.loadTasks('tasks');

  grunt.registerTask('build', [
    'clean',
    'ember_handlebars',
    'transpile:main',
    'concat:main',
    'concat:main_css',
    'build_ember_debug',
    'jshint:all',
    'copy:chrome_extension',
    'wrap:chrome_ember_debug',
    'copy:firefox_extension',
    'wrap:firefox_ember_debug',
    'copy:firebug_extension',
    'wrap:firebug_ember_debug'
  ]);

  grunt.registerTask('build_ember_debug', [
    'transpile:ember_debug',
    'copy:ember_debug',
    'concat:ember_debug'
  ]);

  grunt.registerTask('build_test', [
    'build',
    'transpile:tests',
    'copy:tests',
    'concat:ember_extension_tests',
    'concat:ember_debug_tests',
    'jshint:tests'
  ]);

  grunt.registerTask('build_xpi', [
    'mozilla-addon-sdk',
    'mozilla-cfx-xpi:stable_firefox'
  ]);
  
  grunt.registerTask('build_xpi_firebug', [
    'mozilla-addon-sdk',
    'mozilla-cfx-xpi:stable_firebug'
  ]);

  grunt.registerTask('run_xpi', ['build', 'build_xpi', 'mozilla-cfx:run_firefox']);
  grunt.registerTask('run_xpi_firebug', ['build', 'build_xpi_firebug', 'mozilla-cfx:run_firebug']);

  grunt.registerTask('build_and_upload', [
    'build',
    'compress:main',
    'build_xpi',
    'ember-s3'
  ]);
  
  grunt.registerTask('build_and_upload_firebug', [
    'build',
    'compress:main',
    'build_xpi',
    //'ember-s3' // No uploading of firebug-extension yet
  ]);

  grunt.registerTask('server', ['build_test','connect','watch']);

  grunt.registerTask('test', ['build_test', 'connect',  'qunit:all']);

  grunt.registerTask('default', ['build']);

};

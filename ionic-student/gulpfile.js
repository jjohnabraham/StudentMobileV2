const gulp = require('gulp');
const replace = require('gulp-replace');
const argv = require('yargs').argv;
const fs = require('fs');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
var htmlbeautify = require('gulp-html-beautify');

var school = argv.School;

if (school === 'AIU') {
  argv.cecthemeid = 18;
}
else if (school === 'CTU') {
  argv.cecthemeid = 9;
}

var themeid = argv.cecthemeid || 9;
var cecenv = argv.cecenv || 'dev';
var version = argv.Version || (new Date()).getTime();
var brand = themeid === 18 ? 'aiu' : 'ctu';

function deleteConfig(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

function deleteConfigs() {
  deleteConfig('www/assets/config.js');
  deleteConfig('www/assets/init.js');
  deleteConfig('www/assets/app.js');
  deleteConfig('www/assets/loader/dev/app.js');
  deleteConfig('www/assets/loader/loading/loading.js');
  deleteConfig('www/assets/loader/script/script.js');
}

function buildServerBuild() {
  prepareEnv('dev');
  prepareEnv('int');
  prepareEnv('reg');
  prepareEnv('prod');
}

function cacheSuffixes() {
  gulp.src('www/index.html')
    .pipe(htmlbeautify({ indentSize: 2 }))
    .pipe(replace(/\?cs=(.*)\"/g, '\?cs=' + version + '\"'))
    .pipe(replace(/src=\"(.*)\.js\"/g, 'src=\"$1\.js?cs=' + version + '\"'))
    .pipe(replace(/href=\"(.*)\.css\"/g, 'href=\"$1\.css?cs=' + version + '\"'))
    .pipe(gulp.dest('www', { overwrite: true }));
}

function prepareEnv(env) {
  console.log('Configured environment: ' + env);

  cacheSuffixes();

  var dir = 'Release';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  dir = 'Release/' + env;

  if (fs.existsSync(dir)) {
    fs.unlinkSync(dir);
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  gulp.src('www/**')
    .pipe(gulp.dest(dir))
    .on('end', function () {
      var config = require('./_transform/' + env + '/config');

      if (env == 'prod') {
        console.log('Transform PROD with customurlscheme');

        gulp.src('_transform/config.js')
          .pipe(replace('@@themeid', themeid))
          .pipe(replace('@@env', env))
          .pipe(replace('@@api', config.api))
          .pipe(replace('@@messengerapi', config['messengerapi_' + themeid] || config['messengerapi']))
          .pipe(replace('@@content', config.content))
          .pipe(replace('@@brand', brand))
          .pipe(replace('@@onboardingscreensversion', config.onboardingscreensversion))
          .pipe(replace('@@customurlscheme', config.customurlscheme))
          .pipe(replace(brand + 'cecconnect', 'cecconnect' + brand))
          .pipe(uglify())
          .pipe(gulp.dest(dir + '/assets'));
      }
      else {
        gulp.src('_transform/config.js')
          .pipe(replace('@@themeid', themeid))
          .pipe(replace('@@env', env))
          .pipe(replace('@@api', config.api))
          .pipe(replace('@@messengerapi', config['messengerapi_' + themeid] || config['messengerapi']))
          .pipe(replace('@@content', config.content))
          .pipe(replace('@@brand', brand))
          .pipe(replace('@@onboardingscreensversion', config.onboardingscreensversion))
          .pipe(replace('@@customurlscheme', config.customurlscheme))
          .pipe(uglify())
          .pipe(gulp.dest(dir + '/assets'));
      }
      gulp.src('_transform/init.js')
        .pipe(replace('@@version', "'" + version + "'"))
        .pipe(uglify())
        .pipe(gulp.dest(dir + '/assets'));
    });



}

function uglifyStaticAsset(path, dir, useBabel) {
  if (path) {
    console.log('start - ' + path);

    if (useBabel) {
      return gulp.src(path)
        .pipe(babel({
          presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(dir))
        .on('end', function () {
          console.log('end - ' + path);
        });
    } else {
      return gulp.src(path)
        .pipe(uglify())
        .pipe(gulp.dest(dir))
        .on('end', function () {
          console.log('end - ' + path);
        });
    }

  }
}

function uglifyStaticAssets() {
  deleteConfig('www/assets/app.js');
  deleteConfig('www/assets/loader/dev/app.js');
  deleteConfig('www/assets/loader/loading/loading.js');
  deleteConfig('www/assets/loader/script/script.js');

  uglifyStaticAsset('src/assets/loader/dev/app.js', 'www/assets/loader/dev', true);
  uglifyStaticAsset('src/assets/loader/loading/loading.js', 'www/assets/loader/loading', true);
  uglifyStaticAsset('src/assets/loader/script/script.js', 'www/assets/loader/script', false);
  return uglifyStaticAsset('src/assets/app.js', 'www/assets', true);
}

var prepareBuild = function () { };

if (argv.cecenv) {
  prepareBuild = function () {
    var version = '' + (new Date()).getTime();

    var config = require('./_transform/' + cecenv + '/config');

    var path = 'www/assets/config.js';
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    path = 'www/assets/init.js';
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    gulp.src('_transform/config.js')
      .pipe(replace('@@themeid', themeid))
      .pipe(replace('@@env', cecenv))
      .pipe(replace('@@api', config.api))
      .pipe(replace('@@messengerapi', config['messengerapi_' + themeid] || config['messengerapi']))
      .pipe(replace('@@content', config.content))
      .pipe(replace('@@brand', brand))
      .pipe(replace('@@onboardingscreensversion', config.onboardingscreensversion))
      .pipe(replace('@@customurlscheme', config.customurlscheme))
      .pipe(uglify())
      .pipe(gulp.dest('www/assets'));

    gulp.src('_transform/init.js')
      .pipe(replace('@@version', version))
      .pipe(uglify())
      .pipe(gulp.dest('www/assets'));
  };

} else {

  prepareBuild = function () {
    var version = '' + (new Date()).getTime();

    var path = 'www/assets/init.js';

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    gulp.src('src/assets/config.js')
      .pipe(uglify())
      .pipe(gulp.dest('www/assets'));

    gulp.src('_transform/init.js')
      .pipe(replace('@@version', version))
      .pipe(uglify())
      .pipe(gulp.dest('www/assets'));
  };
}

gulp.task('addcache', done => {
  cacheSuffixes();
  done();
});

gulp.task('serve:before', done => {
  deleteConfigs();
  done();
});
gulp.task('serve:after', done => {
  prepareBuild();
  done();
  //return uglifyStaticAssets();
});

gulp.task('build:before', done => {
  deleteConfigs();
  done();
});
gulp.task('build:after', done => {
  prepareBuild();
  return uglifyStaticAssets();
  done();
});

gulp.task('ionic:serve:before', done => {
  deleteConfigs();
  done();
});
gulp.task('ionic:serve:after', done => {
  prepareBuild();
  done();
  //return uglifyStaticAssets();
});

gulp.task('ionic:build:before', done => {
  deleteConfigs();
  done();
});
gulp.task('ionic:build:after', done => {
  prepareBuild();
  return uglifyStaticAssets();
  done();
});


gulp.task('preBuild', done => {
  done();
});
gulp.task('postBuild', done => {
  buildServerBuild();
  done();
});

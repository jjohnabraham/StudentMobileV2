 var gulp = require('gulp'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    argv = require('yargs').argv,
    //taco = require('taco-cli'),
    runSequence = require('run-sequence'),
    del = require('del'),
    chmod = require('gulp-chmod'),
    process = require('child_process'),
    fs = require('fs'),
    os = require('os');

/*Variables*/
var buildArguments = {};
var appSettings = {};

//default compiler output directory based on environment
var defaultIosOutputDir = null;
var defaultAndroidOutputDir = null;

//default package output directory if not set by user
var defaultPackageOutputDir = "./bin/";

var isWin = /^win/.test(os.platform());

/*Enums*/
var ENV_TYPE = {
    DEV: 'dev',
    INT: 'int',
    REG: 'reg',
    PROD: 'prod'
};

var BRAND = {
    AIU : 'aiu',
    CTU : 'ctu'
};

var PLATFORM = {
    ANDROID: 'android',
    IOS: 'ios'
};

var PROC_STATUS = {
    NONE: -1,
    SUCCESS: 0,
    INPROGRESS: 1,
    FAILED: 2
};

/*Methods */
function GetEnvironment() {
    if (argv.env) {
        var envArg = argv.env.toLowerCase();

        if (envArg == "prod") {
            return ENV_TYPE.PROD;
        } else if (envArg == "reg") {
            return ENV_TYPE.REG;
        } else if (envArg == "int") {
            return ENV_TYPE.INT;
        }
    }

    return ENV_TYPE.DEV;
};

function GetBrandName() {
    if (argv.ctu) {
        return BRAND.CTU;
    }

    return BRAND.AIU;
}

function GetPlatforms() {
    var platforms = [];

    if (argv.platform) {
        var arg = argv.platform.toLowerCase();
        var items = [];

        if (arg.indexOf(',') > 0) {
            items = arg.split(',');
        } else {
            items.push(arg);
        }

        for (var ind = 0; ind < items.length; ind++) {
            var platform = items[ind];
        
            if (platform == PLATFORM.IOS) {
                platforms.push(PLATFORM.IOS)
            }
            else if (platform == PLATFORM.ANDROID) {
                platforms.push(PLATFORM.ANDROID)
            }
        }
    }

    return platforms;
};

function GetAppResourceDir(brand, env) {
    if (env) {
        var dir = '';

        if (brand == BRAND.CTU) {
            dir = 'ctu/';
        }
        else {
            dir = 'aiu/';
        }

        if (dir) {
            return dir;
        }
    }

    return null;
}

function GetApplicationName() {
    if (appSettings) {
        var config = appSettings.AppConfigurations;
        if (config && config.AppName) {
            return config.AppName;
        }
    }

    return null;
}

function GetApplicationPackageName() {
    if (appSettings) {
        var config = appSettings.AppConfigurations;
        if (config && config.AppName) {
            if (config.Version && config.Build) {
                return `${config.AppName}-${config.Version}-${config.Build}`;
            } else {
                return config.AppName;
            }
        }
    }

    return null;
}

function GetPackageOutputDir() {
    if (argv.outputDir) {
        var outputDir = argv.outputDir;
        if (!outputDir.endsWith("\\") && !outputDir.endsWith("/")) {
            outputDir = `${outputDir}/`;
        }

        return outputDir;
    }

    return defaultPackageOutputDir;
};

function LogMessage(message) {
    if (message) {
        var now = new Date();
        var currentTime =  now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        console.log(`[${currentTime}] ${message}`);
}
}

function DirectoryExists(directory, cb) {  
    try {
        fs.statSync(directory);
    } catch(e) {
        cb(e);
    }
}

function InitBuildVariables() {
    var platforms = GetPlatforms();
    var brand = GetBrandName();
    var env = GetEnvironment();
    var appResourceDir = GetAppResourceDir(brand, env);

    var themeId = 0;
    var cleanOutputDir = "false";

    if (brand == "ctu") {
        themeId = 9;
    } else if (brand == "aiu") {
        themeId = 18;
    }

    if (argv.cleanOutputDir) {
        cleanOutputDir = "true";
    }

    var packageOutputPath = GetPackageOutputDir();
    
    //validate parameters
    //check if package output dir is valid
    var error = null;
    DirectoryExists(packageOutputPath,function(e){
        error = `outputDir "${packageOutputPath}" is not exists. Error: ${e}\n`;
    });

    //set default output directory for compiler
    defaultAndroidOutputDir = "./platforms/android/build/outputs/apk/release/";
    defaultIosOutputDir = "./platforms/ios/build/device/";

    if (env == ENV_TYPE.PROD) {
        defaultIosOutputDir = `${defaultIosOutputDir}`;
    } else {
        defaultIosOutputDir = `${defaultIosOutputDir}`;
    }

    //uncomment if run from mac osx
    //defaultIosOutputDir = "./platforms/ios/build/device/";

        var buildConfigFile = `./${appResourceDir}` + `build-legacy-${env}.json`;
    

    

    //temporary to build apps with adhoc prov profile
    //if (env == ENV_TYPE.INT || env == ENV_TYPE.REG) {
    //    buildConfigFile = `./${appResourceDir}` + `build-non-prod.json`;
    //}

    DirectoryExists(buildConfigFile,function(e){
        error = error + `outputDir "${buildConfigFile}" is not exists. Error: ${e}`;
    });

    if (error) {
        LogMessage(error);
        return false;
    }
    
    buildArguments["Platforms"] = platforms;
    buildArguments["Brand"] = brand;
    buildArguments["Env"] = env;
    buildArguments["AppResourceDir"] = appResourceDir;
    buildArguments["TemplateDir"] = "template";
    buildArguments["ThemeId"] = themeId;
    buildArguments["PackageOutputPath"] = packageOutputPath;
    buildArguments["CleanOutputDir"] = cleanOutputDir;
    buildArguments["BuildConfigFile"] = buildConfigFile;

    return true;
}

function ReadFile(filePath) {
    if (filePath) {
        if (!fs.existsSync(filePath)) {
            LogMessage(
                "File '{filePath}' not found."
                .replace("{filePath}", filePath));

            return null;
        }

        return fs.readFileSync(filePath, "utf8");
    }
}

function LoadAppSettings(env, appResourceDir) {
    if (appResourceDir) {
        var appSettingsPath = "./" + appResourceDir + "app-settings.json";
        var data = ReadFile(appSettingsPath);
        if (data) {
            LogMessage("Loading application settings from '" + appSettingsPath + "'");

            var settings = JSON.parse(data);
            if (settings) {
                //load environment specific app settings
                 var platforms = buildArguments.Platforms;
    var tasks = ['before-build'];

    for (var ind = 0; ind < platforms.length; ind++) {
        var platform = platforms[ind];

        
                if (platform == PLATFORM.IOS)
                {
                    appSettingsPath = "./" + appResourceDir + "app-settings-Legacy-ios-" + env.toLowerCase() + ".json";
                }
                if (platform == PLATFORM.ANDROID)
                {
                    appSettingsPath = "./" + appResourceDir + "app-settings-Legacy-android-" + env.toLowerCase() + ".json";
                }
    }


                var data = ReadFile(appSettingsPath);
                if (data) {
                    var envSettings = JSON.parse(data);
                    if (envSettings) {
                        if (settings.AppConfigurations && envSettings.AppConfigurations) {
                            var configs = envSettings.AppConfigurations;

                            for (var key in configs) {
                                if (configs.hasOwnProperty(key)) {
                                    settings.AppConfigurations[key] = configs[key];
                                }
                            }
                        }

                        if (settings.Preferences && envSettings.Preferences) {
                            var preferences = envSettings.Preferences;

                            for (var key in preferences) {
                                if (preferences.hasOwnProperty(key)) {
                                    settings.Preferences[key] = preferences[key];
                                }
                            }
                        }
                    }
                }

                appSettings = settings;
                return true;
            }
        }
    }

    return false;
}

function GetAndroidVersionCode(version, build, patch) {
    if (version && build) {
        patch = patch || 0;

        var versionNumber = parseInt(version.toString().replace(/\./g, ''));
        var buildNumber = parseInt(build.toString());
        var patchNumber = parseInt(patch.toString())

        if (!isNaN(versionNumber) && !isNaN(buildNumber) && !isNaN(patchNumber)) {
            return (versionNumber * 10000) + (buildNumber * 100) + patchNumber;
        }
    }

    return 0;
}

function InitApp() {
    var init = InitBuildVariables();
    if (!init) {
        LogMessage("Error on initilization application.");
        return 0;
    }

    var loaded = LoadAppSettings(buildArguments.Env, buildArguments.AppResourceDir);
    if (!loaded) {
        LogMessage("Application settings was not loaded properly.");
        return 0;
    }

    return true;
}

function ChangeFileAttributes(path, readOnly, hidden, cb) {
    var cmd = '';

    if (!isWin) {
        cmd = `chmod -R 777 ${path}/*`;
    }
    else {
        var attr = ''

        if (readOnly) {
            attr = attr + "+r";
        }
        else {
            attr = attr + "-r";
        }

        if (hidden) {
            attr = attr + " +h";
        }
        else {
            attr = attr + " -h";
        }

        var cmd = `attrib ${attr} ${path}/*.* /s /D`;
    }

    process.exec(cmd, function (err, stdout, stderr) {
        cb();
    });

}

function RunTacoCommand(proc, args, isSpawn, cb, stopOnError) {
    var cmd = '';
    var procStatus = PROC_STATUS.SUCCESS;

    LogMessage(`Executing command '${proc} ${args}'`);

    if (isSpawn) {
        cmd = process.spawn(proc, args.split(" "), { shell: true });
    } else {
        var cmdText =
            "{proc} {args}"
            .replace("{proc}", proc)
            .replace("{args}", args);

        cmd = process.exec(cmdText, { maxBuffer: 1024 * 500 });
    }

    cmd.stdout.on('data', (data) => {
        LogMessage(`${data}`);
});

cmd.stderr.on('data', (data) => {
    LogMessage(`stderr: ${data}`);
procStatus = PROC_STATUS.FAILED;
});

cmd.on('close', (code) => {
    LogMessage(`process exited with code ${code} for command '${proc} ${args}'`);

if (stopOnError && procStatus == PROC_STATUS.FAILED && code != '0') {
    throw "Process ended with above errors.";
}

if (cb) {
    cb();
}
});
}

/*Tasks*/
gulp.task('transform-app-settings', function () {
    if (appSettings) {
        var templateDir = buildArguments.TemplateDir;
        var settingTemplateFilePath =
            "./{templateDir}/app-settings.js"
            .replace("{templateDir}", templateDir);

        LogMessage("Transforming application environment specific settings");

        var prefs = appSettings.Preferences;

        var appUrl = prefs.Url;
        var themeId = prefs.ThemeId;
        var environment = prefs.Environment;

        gulp.src([settingTemplateFilePath])
            .pipe(replace('{app-url}', appUrl))
            .pipe(replace('{theme-id}', themeId))
            .pipe(replace('{environment}', environment))
            .pipe(rename('app-settings.js'))
            .pipe(gulp.dest('www/settings/', { "mode": "0777" }))
    }
});

gulp.task('transform-config', function (cb) {
    if (appSettings) {
        var templateDir = buildArguments.TemplateDir;
        var configTemplateFilePath =
            "./{templateDir}/config-{env}.xml"
            .replace("{templateDir}", templateDir)
            .replace("{env}", buildArguments.Env);

        var config = appSettings.AppConfigurations;
        LogMessage("Transforming application configurations");

        var appId = config.AppId;
        var appName = config.AppName;
        var version = config.Version;
        var build = config.Build;
        var patch = config.Patch;
        var appDescription = config.AppDescription;
        var resourceDirName = config.ResourceDirName;
        var customUrlScheme = config.CustomUrlScheme;
         if (argv.Build)
    {


            config.Build= argv.Build.toString().replace('C', '');
        }

        var build = config.Build;
        //update config.xml
        gulp.src([configTemplateFilePath])
            .pipe(replace('{app-id}', appId))
            .pipe(replace('{app-name}', appName))
            .pipe(replace('{app-version}', version))
            .pipe(replace('{app-build}', build))
            .pipe(replace('{android-version-code}', GetAndroidVersionCode(version, build, patch)))
            .pipe(replace('{app-description}', appDescription))
            .pipe(replace('{brand}', resourceDirName))
            .pipe(replace('{custom-url-scheme}', customUrlScheme))
            .pipe(replace('{urban-airship-app-key}', config.UrbanAirshipAppKey))
            .pipe(replace('{urban-airship-app-secret}', config.UrbanAirshipAppSecret))
            .pipe(replace('{urban-airship-gcm-sender-id}', config.UrbanAirshipGcmSenderId))
            .pipe(rename('config.xml'))
        	.pipe(gulp.dest('./', { "mode": "0777" }))
    }

    cb();
});

gulp.task('transform-build-settings', function (cb) {

    var buildConfigFile = buildArguments["BuildConfigFile"];

    if (buildConfigFile) {
        gulp.src([buildConfigFile])
            .pipe(rename('build.json'))
            .pipe(gulp.dest('./', { "mode": "0777" }))
    }

    if (cb) {
        cb();
    }
});

gulp.task('transform-firebase-config', function (cb) {
    var env = buildArguments.Env;
    var appResourceDir = buildArguments.AppResourceDir;
    var buildConfigFile = [`${appResourceDir}/google-services-${env}.json`, `${appResourceDir}/GoogleService-Info-${env}.plist`];

    gulp.src(buildConfigFile)
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(`-${env}`, '')
        }))
        .pipe(gulp.dest('./', { "mode": "0777" }))

    if (cb) {
        cb();
    }
});

gulp.task('copy-custom-plugins', function (cb) {

    var src = './custom-plugins';
    var dest = './plugins';

    ChangeFileAttributes(dest, false, false, function () {
        gulp.src([`${src}/**/*`], { base: src })
            .pipe(gulp.dest(dest, { "mode": "0777" }));

        //restore the changes
        //ChangeFileAttributes(dest, false, true, function () { });

        if (cb) {
            cb();
        }
    });
});

gulp.task('clean', function (cb) {
    del(['bld/**', '!bld']);
    del(['platforms/**', '!platforms']);

    //clean default output directory
    del([`${defaultAndroidOutputDir}**`, , `!${defaultAndroidOutputDir.replace(/\/$/, '') }`]);
del([`${defaultIosOutputDir}**`, , `!${defaultAndroidOutputDir.replace(/\/$/, '') }`]);

if (buildArguments.CleanOutputDir == "true") {
    //clean bin folder
    console.log(`Cleaning files from : '${buildArguments.PackageOutputPath}'`);
    del([`${buildArguments.PackageOutputPath}**`, `!${buildArguments.PackageOutputPath.replace(/\/$/, '') }`]);
}

del(['www/settings/app-setting.js']);
del(['config.xml']);
cb();
});

gulp.task('remove-platform-android', function (cb) {
    RunTacoCommand('taco', 'platform remove android', false, cb);
});

gulp.task('remove-platform-ios', function (cb) {
    RunTacoCommand('taco', 'platform remove ios', false, cb);
});

gulp.task('add-platform-android', function (cb) {
    RunTacoCommand('taco', 'platform add android', false, cb);
});

gulp.task('add-platform-ios', function (cb) {
    RunTacoCommand('taco', 'platform add ios', false, cb);
})

//gulp.task('install-dependencies-android', function (cb) {
//    RunTacoCommand('taco', 'install-reqs android', false, cb);
//});

//gulp.task('install-dependencies-ios', function (cb) {
//    RunTacoCommand('taco', 'install-reqs ios', false, cb);
//});

gulp.task('add-plugins', function (cb) {
    var brand = GetBrandName();
    var env = GetEnvironment();

    var urlScheme = '';

    if (env != 'prod') {
        urlScheme = `${brand}student${env}`;
    } else {
        urlScheme = `${brand}student`;
    }

    RunTacoCommand('taco', `plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=${urlScheme}`, false, cb);
});

gulp.task('remove-plugins', function (cb) {
    RunTacoCommand('taco', `plugin remove cordova-plugin-customurlscheme`, false, cb);
});

gulp.task('before-build', function (cb) {
    InitApp();

    var platforms = buildArguments.Platforms;
    var tasks =
        ['clean',
            ['remove-plugins'],
            ['transform-config', 'transform-app-settings', 'transform-build-settings', 'add-plugins', 'transform-firebase-config', 'copy-custom-plugins'],
        ];

    var env = GetEnvironment();
    for (var ind =0; ind <platforms.length; ind++) {
        var platform = platforms[ind];

        if (platform == PLATFORM.IOS) {
            tasks.push('remove-platform-ios');
            tasks.push('add-platform-ios');
            //tasks.push('install-dependencies-ios');
        }
        else if (platform == PLATFORM.ANDROID) {
            tasks.push('remove-platform-android');
            tasks.push('add-platform-android');
        }
    }

    tasks.push(cb);
    runSequence.apply(null, tasks);
});

gulp.task('build-android', function (cb) {
    RunTacoCommand('taco', 'build android --release --device', true, cb, false);
});

gulp.task('build-ios', function (cb) {
    var brand = GetBrandName();
    var env = GetEnvironment();

    var buildCmd = 'build ios --device';
    if (env == ENV_TYPE.PROD) {
        buildCmd = `${buildCmd} --release`;
    }

    RunTacoCommand('taco', buildCmd, true, cb, false);
});


gulp.task('copy-android-package', function (cb) {
    LogMessage('Cpoying Package');

    var outputDir = `${buildArguments.PackageOutputPath}`;
    var appName = GetApplicationName();
    var appPackageName = GetApplicationPackageName().replace(new RegExp(' ', 'g'), '-').replace(/\./g, '');
    

    var sourceDir = defaultAndroidOutputDir;
    var packageFiles = [
        
        `${sourceDir}android-release.apk`];

gulp.src(packageFiles)
    .pipe(rename(function (path) {
        path.basename = path.basename.replace('android', appPackageName).replace('-release', '');
    }))
    .pipe(gulp.dest(outputDir, { "mode": "0777" }));

LogMessage('Android package file (.apk) copied to: ' +outputDir);

cb();
});

gulp.task('copy-ios-package', function (cb) {
    var outputDir = `${buildArguments.PackageOutputPath}`;
    var appName = GetApplicationName();
    var appPackageName = GetApplicationPackageName().replace(new RegExp(' ', 'g'), '-').replace(/\./g, '');

    var sourceDir = defaultIosOutputDir;
    //var packageFiles = [
    //    `${sourceDir}${appName}.ipa`,
    //    `${sourceDir}${appName}.app.dSYM.zip`,
    //    `${sourceDir}${appName}.plist`];

    var packageFiles = [
            `${sourceDir}${appName}.ipa`];

gulp.src(packageFiles)
    .pipe(rename(function (path) {
        path.basename = path.basename.replace(appName, appPackageName);
    }))
    .pipe(gulp.dest(outputDir, { "mode": "0777" }));

LogMessage('IOS package file "' +`${sourceDir}${appName}.ipa` + '" copied to: ' +outputDir);

cb();
});

//gulp.task('after-build', function (cb) {

//});

gulp.task('build', function (cb) {
    var result = InitApp();
    if (!result) {
        return 0;
    }

    var platforms = buildArguments.Platforms;
    var tasks = ['before-build'];

    for (var ind = 0; ind < platforms.length; ind++) {
        var platform = platforms[ind];

        if (platform == PLATFORM.IOS) {
            tasks.push('build-ios');
            tasks.push('copy-ios-package');
        }
        else if (platform == PLATFORM.ANDROID) {
            tasks.push('build-android');
            tasks.push('copy-android-package');
        }
    }

    //tasks.push('after-build');
    tasks.push(cb);
    runSequence.apply(null, tasks);

});

gulp.task('help', function () {
    var helpText = `
=================================================================
   =>   Student App Build Tools for AIU and CTU, V 1.0.0    <=
=================================================================

Example of gulp build command:

        Build Android Package for AIU DEV
        gulp build  --aiu   --platform=android


        Build Android and IOS Package for CTU INT
        gulp build  --ctu   --platform=android,ios  --env=int


        Set Output Directory for Packages
        gulp build --ctu --platform=android,ios --env=int --outputDir=C:/temp/IOS/ --cleanOutputDir


    Build Arguments:

        --aiu / --ctu
    Represent the brand/school (eg. aiu/ctu). For example, If we pass --ctu in build command then it will create package for CTU
    Default value: aiu


    --platform
    The platform argument indicates which package to create (eg.iOS, android, etc).Currently, build engine only support ios and android platform.The build engine supports multiple platforms.For example, If we want to build package for both android and iOS then we need to pass “--platform=android, ios”.


    --env
    This argument indicates the environment for the package.The possible values are:
    a.dev
    b.int
    c.reg
    d.prod
    Default value: dev


    --outputDir
    Pass this flag to set package output directory.
    Default value: “./bin/”


    --cleanOutputDir
    if this argument pass then all the files from the output directory will be deleted before the build.By default the output directory is the “bin” folder.
    Default value: false
    `;

    console.log(helpText);
});
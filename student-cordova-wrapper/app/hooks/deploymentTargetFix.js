#!/usr/bin/env node

// Workaround for https://github.com/dpa99c/cordova-plugin-firebasex/issues/766
// set CODE_SIGNING_ALLOWED to NO to avoid signing errors during CI Builds

const fs = require("fs");
const path = require("path");
const execa = require("execa");

module.exports = (context) => {
    const platformPath = path.resolve(context.opts.projectRoot, "platforms/ios");
    const podfilePath = path.resolve(platformPath, "Podfile");

    if (!fs.existsSync(podfilePath)) {
        console.log(`'${podfilePath}' does not exist. Firebase deployment fix skipped.`);
        return;
    }

    let podfileContent = fs.readFileSync(podfilePath, "utf-8");
    podfileContent = podfileContent.replace(/'11.0'/g, 11);

    if (podfileContent.indexOf("post_install") == -1) {
        podfileContent += `
        post_install do |installer|
            installer.pods_project.targets.each do |target|
                target.build_configurations.each do |config|
                    config.build_settings.delete 'IPHONEOS_DEPLOYMENT_TARGET'
                    config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
                    config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
                    config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] ='NO'
                    config.build_settings['ONLY_ACTIVE_ARCH'] = 'YES'
                end
            end
        end
        
        IPHONEOS_DEPLOYMENT_TARGET=11.0
        `;
    }

    fs.writeFileSync(podfilePath, podfileContent, "utf-8");

    return execa("pod", ["install", "--verbose"], {
        cwd: platformPath,
    });
};
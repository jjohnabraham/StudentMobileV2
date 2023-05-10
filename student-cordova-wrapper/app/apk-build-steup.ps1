write-host -fore Cyan "Installing Global Node Modules"
invoke-expression 'npm install -g cordova@">8.0.0 <9.0.0" ionic@">=3.19.1 <4.0.0" gulp@3.9.1'
write-host -fore Cyan "Installing Local NPM Packages"
invoke-expression 'npm install'

write-host -fore Cyan "Installing gulp packages needed to build the APK Locally"
invoke-expression 'npm install gulp-rename gulp-replace yargs run-sequence del gulp-chmod child_process fs --save-dev'

write-host -fore Cyan "Installing cordova-custom-config NPM Packages"
cd plugins/cordova-custom-config
invoke-expression 'npm install'
cd ..\..

write-host -fore Cyan "Installing Tools for Apache Cordova (TACO)"
invoke-expression 'npm install -g taco-cli'


powershell write-host -back "Red This next bit will take 15-30 seconds. You do not need to do anything. Please stand by...."
echo n | taco feedback

write-host -fore Cyan "Refreshing node_modules (seems to be necessary)"
remove-item -path node_modules -recurse -force

invoke-expression 'npm install'

write-host -fore Cyan "**OKAY. ALL DONE** You should be able to build using Gulp now. (See docs/BuildSteps.docx)"


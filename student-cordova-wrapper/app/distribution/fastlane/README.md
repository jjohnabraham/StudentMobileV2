fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install

sudo gem cleanup
bundle install
```

## Choose your installation method:

<table width="100%" >
<tr>
<th width="33%"><a href="http://brew.sh">Homebrew</a></td>
<th width="33%">Installer Script</td>
<th width="33%">Rubygems</td>
</tr>
<tr>
<td width="33%" align="center">macOS</td>
<td width="33%" align="center">macOS</td>
<td width="33%" align="center">macOS or Linux with Ruby 2.0.0 or above</td>
</tr>
<tr>
<td width="33%"><code>brew cask install fastlane</code></td>
<td width="33%"><a href="https://download.fastlane.tools">Download the zip file</a>. Then double click on the <code>install</code> script (or run it in a terminal window).</td>
<td width="33%"><code>sudo gem install fastlane -NV</code></td>
</tr>
</table>

# Available Actions
## iOS
### Deploy INT build to Crashlytics:
```
bundle exec fastlane ios deploy to:crashlytics env:int campuses:aiu,ctu ver:110 build:1002
```

### Deploy PROD build to Crashlytics:
```
bundle exec fastlane ios deploy to:crashlytics env:prod campuses:aiu,ctu ver:110 build:1002
```

### Deploy PROD build to Testflight:
```
bundle exec fastlane ios deploy to:testflight env:prod campuses:aiu,ctu ver:110 build:1002
```

### Include package file path:
```
bundle exec fastlane ios deploy to:testflight env:prod campuses:aiu,ctu ver:110 build:1002 filePath:Users/hadron/packages/ios
```
----

## Android
### Deploy INT build to Crashlytics:
```
bundle exec fastlane android deploy to:crashlytics env:int campuses:aiu,ctu ver:110 build:1002
```

### Deploy PROD build to Crashlytics:
```
bundle exec fastlane android deploy to:crashlytics env:prod campuses:aiu,ctu ver:110 build:1002
```
----

### Include package file path:
```
bundle exec fastlane ios deploy to:testflight env:prod campuses:aiu,ctu ver:110 build:1002 filePath:Users/hadron/packages/android
```
----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).

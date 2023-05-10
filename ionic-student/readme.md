1. Install latest node.js LTS version

2. Run before npm install:
* npm install -g @angular/cli@11.2.13
* npm install -g @ionic/cli@6.16.1
* npm i -g cordova@10.0.0
* npm i -g cordova-res@0.15.3

3. Run npm install
4. To install cordova wrappers: run `ionic cordova platform add ios`, `ionic cordova platform add android`
5. For automatic linting in VS Code install: ESLint, Prettier and stylelint plugins   
6. There is a shared VS Code settings.json config that integrates all this plugins. Every file is automatically linted on save.
7. To generate component, for example, in Home module: `ng generate component modules/home/<component-name>`, then add HomeComponent to `declarations` of HomeModule.
See https://angular.io/cli/generate for more.
8. To make build for specific environment: `ionic build --configuration=production`

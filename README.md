# PI Vision Plug-In Library Seed Project
This project is an application skeleton for a PI Vision Plug-In that contains [Angular][angular] components for custom display symbols as well as other future extensibility objects.

## Getting Started
### Prerequisites
* [Node][node] - install the current version
* The `pi-vision-plugin-seed` source code
* Editor of your choice [Visual Studio Code][vscode] is recommended

First you must make a local copy of the pi-vision-plugin-seed project. If you have obtained this code from a git repository it is a good idea to copy the `pi-vision-plugin-seed` folder to a new location and rename it. Developing in the git cloned folder will track your changes as updates to the seed project itself which is probably not what you want.

This project contains a single example display symbol to demonstrate symbol creation of `ExampleComponent`. It is assumed that developers using this seed project would remove this example when creating an actual plug-in symbols.

> Note it's assumed all commands are run from a command prompt in your local and renamed folder. Commands are written in the Windows command line syntax, but all commands should work in a bash environment as well (just change your slashes)

### Installing Dependencies

The seed project requires some dependencies to be in sync with PI Vision dependencies so the symbols can be loaded properly. Check your [package.json](./package.json) and make sure these package versions match *exactly* with the ones used by the released version of PI Vision. The versions used at the time this document was last updated are:
```typescript
"dependencies": {
  "@angular/common": "4.4.4",
  "@angular/compiler": "4.4.4",
  "@angular/core": "4.4.4",
  "@angular/forms": "4.4.4",
  "@angular/platform-browser": "4.4.4",
  "@angular/platform-browser-dynamic": "4.4.4",
  "@angular/router": "4.4.4",
  "core-js": "2.5.1",
  "express": "4.16.1",
  "rxjs": "5.4.3",
  "zone.js": "0.8.17"
},
"devDependencies": {
  "@angular/compiler-cli": "4.4.4",
  "@types/compression": "0.0.34",
  "@types/core-js": "0.9.43",
  "@types/express": "^4.0.37",
  "@types/jasmine": "2.5.38",
  "@types/node": "^8.0.31",
  "camelcase": "^4.0.0",
  "chokidar": "^1.7.0",
  "compression": "1.7.1",
  "concurrently": "3.2.0",
  "fs-extra": "4.0.2",
  "glob": "7.1.2",
  "jasmine-core": "2.8.0",
  "karma": "1.7.1",
  "karma-chrome-launcher": "^2.2.0",
  "karma-cli": "^1.0.1",
  "karma-html-reporter": "^0.2.7",
  "karma-jasmine": "^1.1.0",
  "karma-jasmine-html-reporter": "^0.2.2",
  "nodemon": "^1.12.1",
  "rollup": "^0.41.5",
  "rollup-plugin-commonjs": "^8.1.0",
  "rollup-plugin-node-resolve": "^3.0.0",
  "rollup-plugin-sourcemaps": "^0.4.1",
  "rollup-plugin-uglify": "^1.0.1",
  "semver": "^5.4.1",
  "systemjs": "^0.19.40",
  "ts-loader": "^0.9.5",
  "tslint": "5.7.0",
  "typedoc": "^0.8.0",
  "typescript": "2.5.3"
}
```

Install all dependencies specified in the file (this can take several minutes)
```bash
npm install
```
After this you should have a new folder in the project named `node_modules`

### Naming the Plug-In Library
The first step in developing a Plug-In is to decide on a new name for the Plug-In library. The name is stored in the file [`package.json`](package.json) under the `name` setting. Change `example-symbol-library` to something else.
```
{
  "name": "example-symbol-library",
  "version": "1.0.0",
  ...
```
Choose a new name using all lowercase characters, numbers, and dashes. The name can not start with a number or dash. It is also a good idea to rename the root folder as well. This name will be used as the base of generated file names and as the library instance name in Javascript. As an object in code the name is converted to "camel case". So in the above example `example-symbol-library` becomes `exampleSymbolLibrary`.

### Build
Run the following command to build this project as a single file JavaScript library.
```bash
npm run build
```
After this, you should find out that you have two new folders in your project.

* `dist` - contains both a compressed (minified) as well an uncompressed Plug-In JavaScript library
    * ***library-name***.js
    * ***library-name***.js.map
    * ***library-name***.min.js
    * ***library-name***.min.js.map
* `out-tsc` - contains tempoary files used to compile the library

> Note that it is usually more convent to use one of the deployment commands instead of `npm run build` which will both build the javascript library as well as automate the finial packaging and deployment of the Plug-In to a PI Vision installation.

### Deployment to a PI Vision installation (PI Web API)

>Note: This temporary deployment process is subject to change.

Build using the command:

```bash
npm run build
```

Copy the contents of the dist folder (choose whether you want to use the minified versions or not) to its own folder underneath the assets/plugins folder of the deployed PI Vision site.

Update the manifest.json file at the root of the assets/plugins folder to include your new plugin. The format is: 

```typescript
{
  "plugins": [
    { "name": "ExampleSymbols", 
      "path": "/assets/plugins/example-symbol-library/example-symbol-library.js" }]
}
```

### Loading Plugin Library in development mode
PI Vision enables developers to live debug and fine-tune your plug-in library code in development mode before deploying the library. This section describes the steps to run a local Node.js server to debug custom symbols.

#### Creating and Installing an SSL Certificate

The first step is to create and install an SSL certificate for the Node.js server. Ideally developers should use a trusted CA signed certificate for the development server. If that is not an option, a self signed certificate can be used instead. 

##### Self-Signed SSL Certificate

>Note: The `certgen` command mentioned here requires `OpenSSL` utility installed on your machine. In Windows OS, the easiest approach is to use `Git Bash` to run the command because the command line shell comes with `OpenSSL` preinstalled. You can install `Git Bash` by downloading `git` from [here](https://git-scm.com/downloads). Otherwise, you need to download the `OpenSSL` executable manually and add the path to environment variable. `OpenSSL` is not the only option. You may generate self-signed SSL certificate using other approaches, such as the `KeyChain` tool on a Mac. 

If you are planning to use a self-signed certificate, go to the project root directory, and enter `npm run certgen` in command line to generate a certificate for localhost. You will see that a few files are generated under `./ssl` folder. `localhost.crt` and `localhost.key` will be used as the certificate and private key for running Node.js with SSL enabled.

The next step is to install the certificate. Run `npm run certinstall` to install the certificate into Trusted Root Certification Authorities. If you are using a Windows OS, you can go to `certlm.msc` to verity a `localhost` certificate has been installed. 

>Note: It is recommended that when the debugging process is complete and your plugin library is ready to deploy, remove this self signed SSL certificate from Trusted Root Certification Authorities either manually from `certlm.msc` or enter command `npm run certuninstall`. Please be aware that running the `certuninstall` command will also remove any other certificates named 'localhost' from Root Certification Authorities. 

##### Trusted CA signed SSL Certificate
If you are planning to use a CA signed SSL certificate, open `server-conf.json` and you will see a property called `ssl`. This is the object we pass into `Express` framework to configure the private key location and certificate location for the HTTPS server. Change the `key` property to be the path of your private key and `cert` to your certificate path.

You might also want to change the hostname and port number before running the Node server. By default the hostname is set to `localhost` and the port number is `3001`. You can change these parameters by modifying the `localhost` and `port `properties in `server-conf.json` accordingly.

#### Running Node.js development server
Now that we have installed SSL certificate we can run a Node.js server that serves the plug-in library content you developed to the PI Vision site. 

Enter `npm run start` command in the console to start the Node.js server. By default the server is running at port `3001`.

Enter URL `https://localhost:3001/manifest` in your browser to verify that your development server is running properly. You should be able to receive a `JSON` object with the `path` and `name` of your plug-in library. 

>Note: This is for live debugging only and is not a deployment process for custom symbols. 

#### Enable development mode in PI Vision
Launch PI Vision website from your browser and in the homepage, select the Three Line Menu Icon on the upperleft and the click `Options`. In the opened dialogue switch on `development mode`. This is a temporary setting for current browser tab and you will lose the setting when you close the browser tab or clear browser cache. 

After a page refresh, your PI Vision running on current browser tab is in development mode and will prompt you to enter a URL for your plug-in library server. Enter `https://localhost:3001/manifest` in the input box and click connect, your plugin library code is loaded to this instance of PI Vision. You can then create a new display with your custom symbol(s) and debug your code. 

#### Making code changes
Making code changes in your plug-in library under `./src` will automatically trigger a rebuild of the plug-in library and restart of the Node.js server. After refreshing the page on your browser, PI Vision is now running with your latest code.  

## Development
This section describes the structure of the source code in general. You will find more details for creating an Angular component as a PI Vision symbol in [symbol-creation-guide](./symbol-creation-guide.md).

### Directory Layout

<pre>
<b>assets/</b>    --> all external HTML resources, typically images
  <b>images/</b> --> image files use by components (jpegs, svg, etc)
<b>src/</b>       --> all of the source files for the application
  <b>example/</b>    --> all the files for an example PI Vision display symbol (named "ExampleComponent")
    <b>example.component.css</b>          --> css file for the symbol component
    <b>example.component.html</b>         --> Angular HTML template
    <b>example.component.spec.ts</b>      --> unit tests
    <b>example.component.ts</b>           --> the main Angular component for the symbol
  <b>ext-types.ts</b>        --> the main Plug-In API
  <b>ext-tokens.ts</b>       --> the injection tokens for PI Vision providers
  <b>module.ts</b>           --> the main module for the Plug-In
  <b>tsconf.base.json</b>    --> TypeScript base config file
  <b>tsconfig.json</b>       --> TypeScript config for the project
  <b>tsconfig.spec.json</b>  --> TypeScript config for unit testing
<b>.editorconfig</b>    --> cross editor settings to allow supported editors to format new code consistent with the seed's style
<b>.gitignore</b>    --> git ignore file, useful for storing this project in a Git repository
<b>build.js</b>      --> node.js "script" for compiling the library (run via npm run command)
<b>deploy.js</b>     --> node.js "script" for packaging/deploying the library (run via npm run command)
<b>inline-resources.js</b>    --> helper script for builds
<b>karam-test-shim.js</b>     --> helper script for unit test
<b>karma.config.js</b>        --> Config file for running unit tests with Karma
<b>package.json</b>           --> Config file npm package manager
<b>package-update.js</b>      --> helper script to sync dependency versions with PI Vision
<b>README.md</b>                --> This file
<b>symbol-creation-guide.md</b>   --> Additional documentation for symbol creation
<b>symbol-porting-guide.md</b>   --> Additional documentation for porting symbols from PI Vision 3
<b>tslint.json</b>   --> TypeScript linting settings
</pre>

### Module
The module file [`module.ts`](src/module.ts) is the single entry point of the library to bring all parts of the Plug-in library into one single unit ready for use in PI Vision. You can build one or more custom symbols and put them all in one module. 

### Components
Components are UI building blocks for your custom symbol. It is a self contained unit that includes the view and logic for a symbol. In this seed project, we created a component called `ExampleComponent` which includes the code `example.component.ts`, Angular HTML template `example.component.html`, and css styles `example.component.css`. The unit test file `example.component.spec.ts` is not part of the `ExampleComponent` but for consistency purpose we put unit test file next to the code.

### Dependencies
The dependencies and devDependencies section in [package.json](./package.json) show a list of dependencies required to develop and run the plug-in library. All dependency versions **MUST** be in sync with the dependency versions in PI Vision. After `npm install`, you will see packages with versions specified in `package.json` installed under `node_modules`. 

#### Using External Libraries
You can use external libraries in addition to the ones listed in [package.json](./package.json). For example, you might want to feed PI data into some charting library and build your own chart symbol. The first step is to install the library through npm command:
```bash
npm install <your-package-name> --save
```

You can see the package downloaded under `node_modules` directory. A new entry will also be added to package.json. You can then import the library with one of the following `import` forms and use it in your symbol component:
```typescript
import SomeChartLibrary from 'someChartLibrary';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
```

#### Dependency Injection
Dependencies can be injected by defining them as input parameters in the component constructor. The are a few things to know to make dependency injection work in your custom symbol.
* The package that contains the dependency should first be installed through npm command.
```bash
npm install <your-package-name> --save
```

* If you would like to use your own instance of the provider, you need to import the Module for that dependency when describing the metadata of the module(`@NgModule()`) in [`module.ts`](src/module.ts).
* Add the provider as an input to your constructor. If you would like to use the same provider instance being used in PI Vision, insert `@Inject()` decorator before your input parameter with one of the injection tokens provided in [`ext.tokens.ts`](src/ext.tokens.ts). For example, you may want to use `PiWebApiService` provider in `@osisoft/piwebapi` and use the same provider instance PI Vision so the `piWebApiService` knows the base URL to access PI Web API server. In this case, you can pass `PIWEBAPI_TOKEN` into the `@Inject()` decorator. You don't need to import `PiWebApiModule` into your plug-in library because Angular compiler will only look up the provider by injection key in runtime and not complain in compile time.

### Angular Namespaces

Angular components in a Plug-in library support importing *only* from the following angular modules:

 - @angular/core
 - @angular/common
 - @angular/forms

## Unit Testing

This project comes preconfigured with unit tests. These are written in [Jasmine][jasmine], which we run with the [Karma][karma] test runner. We provide a Karma configuration file to run them.

* The configuration is found at `karma.conf.js`.
* The unit tests are found next to the code they are testing and have an `.spec.ts` suffix (e.g.
  `example.component.spec.ts`).

The easiest way to run the unit tests is to use the supplied npm script:
```bash
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will start watching the source and test files for changes and then re-run the tests whenever any of them changes.

This is the recommended strategy; if your unit tests are being run every time you save a file then you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit. This is useful if you want to check that a particular version of the code is operating as expected. The project contains a predefined script to do this:
```bash
npm run test:once
```

## Linting
[TSLint][tslint] is an extensible static analysis tool that checks TypeScript code for readability, maintainability, and functionality errors. It can be run with the following command.
```bash
npm run lint
```
> Popular editors can integrate with TSLint to provide analysis as you type. This [extension](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) for [VS Code][vscode] is recommended.


[angular]: https://angular.io/
[jasmine]: https://jasmine.github.io/
[karma]: https://karma-runner.github.io/
[node]: https://nodejs.org/
[vscode]: https://code.visualstudio.com/
[tslint]: https://github.com/palantir/tslint

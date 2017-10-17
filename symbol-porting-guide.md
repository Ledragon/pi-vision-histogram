# PI Vision Symbol Porting Guide

This guide will walk you through the process of porting an existing custom symbol from PI Vision 3 to PI Vision 4. You should have working knowledge of creating a PI Vision 3 symbol. It is strongly recommended that you follow the steps in [README](../README.md) to understand the  process before reading this documentation.

Here we will convert a PI Vision 3 *Simple Value Symbol* from OSIsoft's GitHub [repository][SimpleValueSymbol] into a PI Vision 4 custom symbol. When you are done with this tutorial, the symbol will look like the symbol in `simple-value` repository. 

## Angular vs AngularJS
PI Vision 4 custom symbols are built on top of Angular framework, while PI Vision 3 symbol is based on AngularJS. Although their names sound similar, there are some major differences when coding under the two platforms, such as:
* TypeScript is used for coding in Angular, while AngularJS uses JavaScript
* Components are used as the building blocks for Angular applications
* Angular uses module loader rather than loading files to HTML with `<script>` tags
* Syntax differences

## Getting Started
We need to create a library project in order to port over a PI Vision 3 custom symbol into PI Vision 4. As mentioned in the [README](../README.md), the easiest way is to copy the seed project folder to a new location and rename the folder. Please follow the [README](../README.md) document to setup the project and verify/install dependencies.

## Symbol Registration
In PI Vision 3, we register the `simple-value` symbol by defining an object with symbol metadata:

```javascript
var definition = {
  typeName: 'simplevalue',
  datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
  visObjectType: symbolVis,
  getDefaultConfig: function() {
    return {
        DataShape: 'Value',
        Height: 150,
        Width: 150,
        BackgroundColor: 'rgb(255,0,0)',
        TextColor: 'rgb(0,255,0)',
        ShowLabel: true,
        ShowTime: false
      };
  },
  configTitle: 'Format Symbol',
  StateVariables: [ 'MultistateColor' ]
};

CS.symbolCatalog.register(definition);
```

In order to port over all the metadata, we need to add these information into an element of the `symbols` property in `PluginLibrary` class in `module.ts`.

```typescript
export class PluginLibrary extends ExtNgPluginLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: ExtSymbolType[] = [
    {
      name: 'simple-value',
      displayName: 'Simple Value Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: SimpleValueComponent,
      sysProps: [
        SysPropType.Data
      ],
      configProps: [
        { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'orange',
          isMultiState: true },
        { propName: 'txtColor', displayName: 'Text Color', configType: ConfigPropType.Color, defaultVal: 'black',
          isMultiState: true },
        { propName: 'showLabel', displayName: 'Show Label', configType: ConfigPropType.Flag, defaultVal: true },
        { propName: 'showTime', displayName: 'Show Time', configType: ConfigPropType.Flag, defaultVal: true }
      ],
      layoutWidth: 150,
      layoutHeight: 150
    }
  ];
}
```

Based on the above code snippets, we will compare the differences between two platforms when registering `simple-value` component.

### Class vs Object
Instead of creating a `definition` JavaScript object as symbol metadata, we are now leveraging `TypeScript` to strongly type metadata for a custom symbol. The `simple-value` symbol's metadata is of `ExtSymbolType`.

### Data Source
`simple-value` symbol in PI Vision 3 uses `datasourceBehavior` and `DataShape` to describe the data source that the symbol needs. In the new platform, we combine them into `dataParams` property and use `single` shape for the data source. 

### System Inputs
In PI Vision 3 we don't need to specify the system inputs, while in PI Vision 4, we offer a list of system-level inputs that you can choose from. Here we need to specify ` SysPropType.Data` in the `sysProps` array because the symbol needs the real-time data from PI System. 

### Configuration properties
In the `definition` object we define `getDefaultConfig` callback to register for the configuration properties in PI Vision 3. We also needed to create a separate configuration template file `sym-simplevalue-config.html` to build the UI and bind the configuration variables with the UI. 

```typescript
getDefaultConfig: function() {
  return {
      DataShape: 'Value',
      Height: 150,
      Width: 150,
      BackgroundColor: 'rgb(255,0,0)',
      TextColor: 'rgb(0,255,0)',
      ShowLabel: true,
      ShowTime: false
  };
}
```

In PI Vision 4, the steps are different. By specifying configuration options in the `configProps` array, config UI will be automatically generated. For example, the `showLabel` configuration option is changed to this object with `propName`, `displayName`, `configType`, and `defaultVal`, where:
* `propName` has the variable name that matches the property name in the returned object  in `getDefaultConfig` callback
* `displayName` is the human friendly name that will show up on the configuration UI, so that we don't need to manually create the config UI template.
* `configType` set to `ConfigPropType.Flag` means that it is a boolean flag and the config UI will generate a switch to allow users to turn it on/off
* `defaultValue` property sets the default value for a configuration property, which is `true` in our `showLabel` case

```typescript
configProps: [
  ...
  { propName: 'showLabel', displayName: 'Show Label', configType: ConfigPropType.Flag, defaultVal: true },
  ...
]
```

### Multistate
In order to configure multistate in PI Vision 3 custom symbol, we need to add an array of strings in the `StateVariables` property in the `definition` object.  

```javascript
var definition = {
  ...
  StateVariables: [ 'MultistateColor' ]
};
```

In PI Vision 4, we don't need to create a new variable for multistating a UI component. We can set `isMultiState` property to true for those config properties that need multi-state functionality. Here we set the multi-state property to `txtColor` config property. When we load the symbol and opens configuration pane, we will be able to multistate the text color of this symbol. 

```typescript
export class PluginLibrary extends ExtNgPluginLibrary {
  ...
  symbols: ExtSymbolType[] = [
    {
      ...
      configProps: [
        ...
        { propName: 'txtColor', displayName: 'Text Color', configType: ConfigPropType.Color, defaultVal: 'black', isMultiState: true }
        ...
      ],
      ...
    }
  ];
}
```

## Symbol Implementation
In this section we will discuss the implementation difference when implementing the symbol logic for the two platforms.

### Angular Component vs IIFE
The PI Vision 3 symbol implementation in [`sym-simplevalue.js`][SimpleValueSymbol] is wrapped in an immediately-invoked function expression (IIFE):

```javascript
(function (CS) {
  function symbolVis() { }
  CS.deriveVisualizationFromBase(symbolVis);

  ...
})(window.PIVisualization);
```

In PI Vision 4 the code logic for a symbol goes into an Angular component. We will need to create a new folder called `simple-value` under `src` directory, and create 3 files under the `simple-value` folder. The three files together compose an Angular Component for the custom symbol.
* `simple-value.component.ts`: This is the most important piece of the component, which includes the class metadata, definition and code logic to handle interations between the symbol and PI Vision 4.
* `simple-value.component.html`: This file is the HTML template for the component. It defines the user interface for the custom symbol.
* `simple-value.component.css`: This file contains the css rules that apply to the current component.

Let's take a look at the skeleton for the `simple-value.component.ts` file, which contains the class name `SimpleValueComponent`, the template file it uses `simple-value.component.html`, and the `css` file the component is associated with:

```typescript
@Component({
  templateUrl: 'simple-value.component.html',
  styleUrls: ['simple-value.component.css']
})
export class SimpleValueComponent implements OnChanges {
}
```

### System-level data updates
PI Vision 3 custom symbol gets updated data through implementing `onDataUpdate` callback in   [`sym-simplevalue.js`][SimpleValueSymbol].

```javascript
this.onDataUpdate = dataUpdate;
function dataUpdate(data) {
    if(data) {
        scope.value = data.Value;
        scope.time = data.Time;
        if(data.Label) {
            scope.label = data.Label;
        }
    }
}
```

To port over the data update code, we need to first specify `data` as an `@Input()` to the component. The name must match the name defined in the `sysProps` in the symbol metadata in `module.ts`. The Angular component we just created also needs to implement the `OnChanges` interface so that the component is aware of the data updates:

```typescript
export class SimpleValueComponent implements OnChanges {
  @Input() data: any;
  value: number;
  time: string;
  label: string;

  ngOnChanges(changes) {
    if (changes.data) {
      if (this.data && this.data.body && this.data.body[0]) {
        this.value = this.data.body[0].value;
        this.time = this.data.body[0].timestamp;
        this.label = this.data.body[0].path;
      }
    }
  }
}
```

Whenever data update occurs, `ngOnChanges()` function will be called and, if `changes.data` exist, which means the system-level data has updated, then we can update the class properties `value`, `time`, and `label`.

### Data binding on config properties

In PI Vision 3 we bind the config properties directly to the view but in PI Vision 4, since each symbol component is self-contained, we need to explicitly define the inputs to the components so that it is aware of the configuration properties we defined in the symbol metadata object in `module.ts`.

Define `txtColor`, `bkColor`, `showLabel`, and `showTime` as `@Input()` to the component. We will use these inputs and bind them with the template later in the tutorial. Since `txtColor` is configured as muti-state color, the input will change based on the muti-state settings

```typescript
export class SimpleValueComponent implements OnChanges {
  @Input() txtColor: string;
  @Input() bkColor: string;
  @Input() showLabel: boolean;
  @Input() showTime: boolean;
}
```

### HTML template and CSS
In order to port over symbol HTML template and CSS files we need to copy the content of the `sym-simplevalue-template.html`[SimpleValueSymbol] into `src/simple-value.component.ts`. There are syntax changes from `AngularJS` to `Angular` so that we need to change accordingly. 

This is the PI Vision 3 custom symbol mark-up:
```html
<div ng-style="{background: config.BackgroundColor, color: MultistateColor || config.TextColor}">
    <div ng-show="config.ShowLabel">{{label}}</div>
    <div>{{value}}</div>
    <div ng-show="config.ShowTime">{{time}}</div>
</div>
```

For example, `ng-style="{background: config.BackgroundColor}"` is changed to `[style.background]="bkColor"` and `ng-show="config.ShowLabel"` is changed to `*ngIf="showLabel"`. Below snippet shows what it looks like after adjusting the syntax. 
```html
<div [style.background]="bkColor"
     [style.color]="txtColor" 
     style="width:100%; height:100%">
  <div *ngIf="showLabel">{{label}}</div>
  <div>{{value}}</div>
  <div *ngIf="showTime">{{time}}</div>
</div>
```

For a list of common syntax changes, please see this [link](https://angular.io/guide/ajs-quick-reference) for more information

## Third-Party Frameworks
In order to use third-party frameworks for a custom symbol, we need to put the library scripts in the the `libraries` folder under PI Vision 3 directory. 

In PI Vision 4, we are leveraging `Node.js` and `npm` to be able to install `npm` packages in the project and then bundle the libraries with `Rollup.js` in the build process.

What we need to do is to install the third party libraries by entering `npm install <your-library>` and then utilize the library by ES6 `imports` syntax in your component. 

## Dependency Injection
PI Vision 3 custom symbol injects dependencies through input parameters in the `init` funciton. For example, the [`Time Series Chart`][TimeSeriesChart] injects `scope` and `elem` into the symbol.
```javascript
symbolVis.prototype.init = function(scope, elem) {
}
```

In PI Vision 4, we inject dependencies through the Angular component constructor. For example, this will allow an Angular component to access the element reference:
```typescript
export class SomeCustomSymbol {
  constructor(private elementRef: ElementRef) { }
}
```


[SimpleValueSymbol]: https://github.com/osisoft/PI-Vision-Custom-Symbols/tree/master/tutorials/simplevalue

[SimpleValueSymbolReadme]: https://github.com/osisoft/PI-Vision-Custom-Symbols/blob/master/tutorials/simplevalue/README.md

[TimeSeriesChart]:
https://github.com/osisoft/PI-Vision-Custom-Symbols/blob/master/tutorials/timeserieschart/sym-timeserieschart.js
# PI Vision Symbol Creation Guide

This documentation assumes that you have read the [README](./README.md) documentation in this repository and are familiar with [Angular][angular] and [JavaScript][javascript] in general. We will walk you through the steps to create a custom symbol.

A single PI Vision symbol consists of two classes.
* An Angular component which provides the visualization for the symbol
* A `SymbolType` object which defines the meta-data about the component

We will first talk about how to build an Angular component and put them into the module. Then we will describe how the metadata is defined for the symbol and register the symbol in the module. 

## Creating an Angular Component
Components are UI building blocks in Angular. The easiest way to create a new component would be to copy and modify the `ExampleComponent` in this seed project. The code snippet we show below are slightly different from the `ExampleComponent` because we want to provide more options to build an Angular component. 

### Metadata Overview:
```typescript
@Component({
  selector: 'radar-chart',
  templateUrl: './radar-chart.html',
  styleUrls: ['./radar-chart.css']
})
```

Use `@Component()` decorator to define metadata for the component. The above code snippet includes some of the most common metadata fields:
* `selector`: The HTML tag name shown in the DOM
* `templateUrl`: The path to the component template file
* `styleUrls`: A list of `css` files for the component

### Inputs
```typescript
export class RadarChartComponent implements OnInit, OnChanges {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
}
```
#### Config property inputs
The `fgColor` and `bkColor` inputs are associated with the configuration properties defined in the `generalConfig` field of the `ExtensionLibrary` class in [`module.ts`](src/module.ts). When end user changes a configuration option from the config pane, the value for the associated input variable will change accordingly.  
>Note: the input variable name should match the string defined in the `propName` property of the `configProps` and both should use camel case.

### System Property inputs
The `data` and `pathPrefix` inputs are system-level inputs associated with the `inputs` of the `ExtensionLibrary` in [`module.ts`](src/module.ts). `data` is one of the special input names which will be bound the real-time PI data by the application. To further configure how this symbol interacts with PI Vision we must provide additional metadata about this symbol outside the component. This is done when we register the symbol with PI Vision. Whenever PI Vision gets real-time data updates, a slice of data will flow into the component through the `data` input. The input data is "shaped" to help visualize the data in the component. The data shape, together with other data parameters are defined in the `dataParams` field in the symbol description in `ExtensionLibrary`. `pathPrefix` is another system input that contains a url prefix. `pathPrefix` could be used to locate static files, e.g. thumbnails, when building a custom symbol.

### Constructor
```typescript
constructor( @Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) {
  // Put bare minimum initialization logic here
}
```
By definition constructor is invoked when the component class is instantiated. We can put bare minimum initialization logic in the constructor but usually asynchronous calls like HTTP requests should not be made in a constructor to make sure the component can be created in the DOM. In Angular We also specify injected dependencies as input parameters in the constructor.

### Lifecycle Hooks
Angular provides lifecycle hooks to components so that when these events occur, components have the ability to respond. We can leverage the lifecycle hooks to build a custom symbol.

```typescript
export class RadarChartComponent implements OnInit, OnChanges {
  ...
  ngOnInit(): void {
    ...
  }
  ...
  ngOnChanges(changes) {
    ...
  }
  ...
```

This class implements the `OnInit` and `OnChanges` interfaces so that it will be notified when Angular creates and updates the component.
* `ngOnInit()`: The method will be called when Angular creates the symbol component. This is the place where you put initialization logic, for example, to create a chart using 3rd party library.
* `ngOnChanges()`: This method will be called whenever any `@input` parameters change. The `changes` input is of time [`SimpleChanges`](https://angular.io/api/core/SimpleChanges), where you would be able to see the current value and previous value. This method should be used when we want to update UI or change internal state based on input change. 

### Registering the Component in the Module
The module file [`module.ts`](src/module.ts) is the single entry point of the library to bring all parts of the Extension library into one single unit ready ready for use in PI Vision. It is not recommended to change this file's name as this would require changes to the projects build system.

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './aot/module.ngfactory';

import { RadarChartComponent } from "./radar-chart/radar-chart.component";

@NgModule({
  declarations: [
    ExampleComponent,
    RadarChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExampleComponent,
    RadarChartComponent
  ],
  entryComponents: [
    ExampleComponent,
    RadarChartComponent
  ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'radar-chart-symbol',
      displayName: 'Radar Chart Symbol',
      dataParams: { shape: 'crosstab', dataMode: 'snapshot' },
      thumbnail: '^/assets/images/chart.svg',
      compCtor: RadarChartComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
          ]
        }
      ],
      layoutWidth: 600,
      layoutHeight: 400
    },
    {
      // some other symbol components..
    }
  ];
}
```

Let's break down each section...
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './aot/module.ngfactory';

import { RadarChartComponent } from "./radar-chart/radar-chart.component";

@NgModule({
  declarations: [
    ExampleComponent,
    RadarChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExampleComponent,
    RadarChartComponent
  ],
  entryComponents: [
    ExampleComponent,
    RadarChartComponent
  ]
})
export class LibModule { }
```
A standard Angular module declaration containing all components and services used by your symbols.
For each symbol in your library import it's component and add it to the `declarations`, `exports`, and `entryComponents` sections of the `@NgModule` decorator. In this example we are registering two symbols, the basic symbol whose component we defined above and *another* component (included to show how to register multiple symbols in a single library).  

It is recommended to name this module `LibModule`, renaming it would require additional changes to the seed projects boiler-plate code.

```typescript
export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'radar-chart-symbol',
      displayName: 'Radar Chart Symbol',
      dataParams: { shape: 'crosstab', dataMode: 'snapshot' },
      thumbnail: '^/assets/images/chart.svg',
      compCtor: RadarChartComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
          ]
        }
      ],
      layoutWidth: 600,
      layoutHeight: 400
    },
    {
      // some other symbol components..
    }
  ];
}
```
This class is similar to the Angular `NgModule`, but contains the metadata specific to PI Vision symbols. Naming the `NgLibrary`  derived class as `"ExtensionLibrary"` is required as the PI Vision application expects the extension library to export class with this name.

`module` and `moduleFactory` must be set to the Angular module type declared above and its "factory" object which is created when the library is built. It was imported with this line: `import { LibModuleNgFactory } from './aot/module.ngfactory'` 

Last, but not least, is the `symbols` array . Each symbol in the library must be declared by creating a `SymbolType` object (normally using the inline object syntax). This object lets PI Vision know that this symbol exists, what to call it, which component to create, what configuration properties does the symbol require, how to query for PI data, and how it interacts with the rest of the application. 

At the very least, each symbol needs a unique `name` (unique within this library). It is recommended this name contain only standard lowercase english characters, numbers, and dashed. `much-like-this`.

`displayName` is a human readable name for this symbol as it appears in various places in the display's UI (the tool box, for example).

`thumbnail` is a Url to an SVG image file used as a small icon for the symbol in the symbol creation tool box in the display. The file should be stored in the assets folder and the filename should be prefixed by `^/assets/images/`. At runtime the `^` will be replaced with the URL to the installed asset files. See [Thumbnails and Other Asset Files](#thumbnails-and-other-asset-files) for more information.

`compCtor` is the class of the Angular component of this symbol. This makes the connection between this metadata and the visual Angular component.

`inputs` is an array of enum values that match the `@Input` property names of the the component for this symbol. Every system-level input must be listed here. It is not enough to simply declare the inputs in the component.

Here are a list of system properties that PI Vision supports:
* `SymbolInputType.Columns`: Adding this property indicates the symbol requested certain columns for data summary
* `SymbolInputType.CursorTime`:  This property lets PI Vision know the symbol needs the Date object when dropping a cursor on the symbol
* `SymbolInputType.Data`: Real time data from PI
* `SymbolInputType.EditMode`: Add this property if symbol needs to know if display is in edit mode
* `SymbolInputType.PathPrefix`: The path prefix is useful if you need to add images to your symbol
* `SymbolInputType.Shape`: Add this if the symbol needs to know its data shape
* `SymbolInputType.Type`: Add this if you are interested in the type of the symbol
* `SymbolInputType.Selected`: Add this to inputs if symbol needs to know whether it is selected

In the example `SymbolInputType.Data` is defined to let PI Vision know this symbols needs real time data from PI. In this case, the `@Input` parameter should be named `data`.

`dataParams` object describes the types of data that the symbol needs to visualize. In our example, we want to create a radar chart showing the snapshot value of multiple data sources. So we use `crosstab` as the data shape, and `snapshot` as the data mode. Please refer to [Data Shapes](#data-shapes)


`generalConfig` is an array of config property groups that describes what properties for the symbol can be configured via user input and organizes them into logical sections (which is reflected in the generated configuration UI). Instead of writing your own template and logic for each config option, PI Vision now allows you to use predefined config options, as shown below: 

* `ConfigPropType.Color`: Use this type if the configuration option changes color
* `ConfigPropType.Num`: User will be able to enter numbers in the config pane
* `ConfigPropType.Text`: Enter text in the config pane and pass into the component
* `ConfigPropType.Flag`: Use this option if the config option is a switch and can be turn on and off
* `ConfigPropType.Url`: Url Config option
* `ConfigPropType.DocumentUrl`: The Url is for a PI Vision document
* `ConfigPropType.Columns`: Modify data columns shown in the symbol
* `ConfigPropType.TextAlign`: Set the text align style
* `ConfigPropType.Datasource`: Set data source input from config UI
* `ConfigPropType.Custom`: Custom config property


Let's also look at an example configuration property:
```typescript
{ propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' }
```
This code block defines the background color property for the symbol. On the config pane, you should be able to see a config option called `Background color` and the default color is `white`. Adding `bkColor` as an `@Input` in the component allows you to use the selected back ground color in your code and template.

### Multistate
You can easily add multistate for a configuration property by setting `isMultiState` to `true` in the configuration object:
```typescript
{ propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white', isMultiState: true }
``` 

By adding this property we are able to open multistate config pane for the custom symbol in PI Vision and configure data source and multi-state conditions to control the background color of the symbol.  

### Thumbnails and Other Asset Files
All files within the `/assets` folder will be deployed along with the library. This provides a way to use external files, like images, in your components templates. To form urls to these files you must declare a *parameter* input on your component named `pathPrefix` as well as adding `SymbolInputType.PathPrefix` in the `inputs` array when defining symbol metadata in `module.ts`. This will contain a Url prefix which can be appended to the filename of the file to form an absolute path to the files.
For example:
```html
<img [src]="pathPrefix + '/assets/my-image.png" />
```
When defining the Thumbnail for a symbol in the `SymbolType` for that symbol prefix the name of the thumbnail with a `^` for this prefix. See [Registering the Component in the Module](#registering-the-component-in-the-module) for an example of this.




### Data Parameters
In class `ExtensionLibrary` in `module.ts` we defined symbol metadata. In the `symbols` array we entered `dataParams` property for each symbol. By specifying `dataParams` we are requesting PI Vision to send real time data into our custom symbol with a given format, to better assist us in visualizing the data in our symbol. In this section, we will walk you through the data shapes and data modes PI Vision support.

#### Data Shapes

##### Single Shape
A `single` data shape is defined if the custom symbol needs to access the recorded value of data source(s) for the current display end time. After setting `{ shape: 'single' }` as the `dataParams` property in `module.ts`, you can expect your component's `data` input to be similar to this object:

```typescript
{
  body: [{
      color: '#1f77b4',
      good: true
      path: '\\Asset1|Attr1',
      timestamp: '2017-10-09T15:10:32Z',
      type: 'Double',
      value: 12.558101654052734
    }]
}
```

##### Trend Shape
A `trend` shape is for symbols trying to visualize data on a trend-like component. This data shape will make `data` input contain plot values for the data source(s) in a given time range. Setting `dataParams` to be `{ shape: 'trend' }` will make your `data` input look like this:

```typescript
{
  body: [{
    color: '#1f77b4',
    events: [{
      timestamp: '2017-10-09T15:39:19.2399749Z',
      value: 29.004425048828125
    }, {
      timestamp: '2017-10-09T15:44:32Z',
      value: 34.353511810302734
    }, {
      timestamp: '2017-10-09T15:46:32Z',
      value: 37.163482666015625
    }],
    path: '\\Asset1|Attr1',
    step: 0
  }, {
    color: '#aec7e8',
    events: [
      timestamp: '2017-10-09T15:39:19.2399749Z',
      value: {
        IsSystem: false,
        Name: 'Above Normal',
        Value: 3
      }, {
        timestamp: '2017-10-09T15:42:02Z',
        value: {
          IsSystem: false,
          Name: 'Below Normal',
          Value: 1
        }
      }],
    path: '\\Asset2|Attr2',
    step: 1
  }],
  starttime: '2017-10-09T15:47:19.094Z',
  endtime: '2017-10-09T15:39:19.094Z'
}
``` 

##### Crosstab Shape
A `crosstab` shape is used when the symbol is trying to compare the real-time data for attributes across multiple data assets in a component. Defining crosstab shape also requires specifying `dataMode` in the `dataParams`. A sample `data` input object for `{ shape: 'crosstab', dataMode: 'snapshot' }` is shown below.

> Note: The attribute data is grouped by assets in `events` property.

```typescript
{
  body: {
    events: [[
      '\\Asset1',
      91.67820739746094,
      92.09439849853516
    ], [
      '\\Asset2',
      46.39336013793945,
      ''
    ]],
    headers: [
      'Element',
      'Attr1',
      'Attr2'
    ], 
    items: [{
      color: '1f77b4',
      id: 'Web ID for \\Asset1|Attr1',
      path: '\\Asset1|Attr1'
    }, {
      color: 'aec7e8',
      id: 'Web ID for \\Asset1|Attr2',
      path: '\\Asset1|Attr2'
    }, {
      color: 'ffbb78',
      id: 'Web ID for \\Asset2|Attr1',
      path: '\\Asset2|Attr1'
    }]
  },
  endTime: '2017-10-09T16:17:19.669Z',
  startTime: '2017-10-09T08:17:19.668Z'
}
```

##### XY Shape
Use `xy` data shape when the symbol is trying to create a symbol similar to scatter plot chart, where you have one base item in the x axis, and one or more data items in the y axis. Below shows an example `data` input into the component:

> Note: `\\Asset1|Attr1` is the data item on x Axis, and `\\Asset2|Attr1` is the data item on y axis.
```typescript
{
  basePath: '\\Asset1|Attr1',
  body: [[
    color: '1f77b4',
    events: [],
    path: '\\Asset1|Attr1'
  ], [
    color: 'aec7e8',
    events: [{
      timestamp: '2017-10-09T15:37:12.5424664Z',
      value: [{
        Good: true,
        Timestamp: '2017-10-09T15:37:12.5424664Z',
        Value: 26.83753776550293
      },
      100.74958038330078
      ]
    }, {
      timestamp: '2017-10-09T16:37:12.5424664Z',
      value: [{
        Good: true, 
        TimeStamp: '2017-10-09T16:37:12.5424664Z'
        Value: 101.510986328125
      },
      87.94261932373047
      ]
    }],
    path: 'Asset2|Attr1'
  ]],
  starttime: '2017-10-09T15:37:12.407Z',
  endtime: '2017-10-09T16:37:12.407Z'
}
``` 

#### Data Modes
`dataMode` is another property in `dataParams` that defines the type of the data entering into the custom symbol. Currently specifying `dataMode` is required for [`crossTab`](#crosstab-shape) data shape. Below are the avalable data mode options:
* `snapshot`: PI Vision will send snapshot values, which are the latest available values for the data source(s)
* `interpolatedValues`: Your custom symbol will get the interpolated value for the data source(s) evaluated at the end of the time range
* `recordedvalues`: PI Vision will pass in recorded values for the given data sources, which are the values from Data Archive for the time period 

[angular]: https://angular.io/
[javascript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

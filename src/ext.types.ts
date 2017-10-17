import { EventEmitter, OnChanges } from '@angular/core';

/**
 * The extensibility version number for this file.
 */
export const EXT_VERSION_NUM = 1;

export const DISPLAY_CATEGORY = 'display';

/**
 * Interface for the Symbol API
 * This interface defines the possible inputs and outputs to the symbol
 */
export interface ExtSymbolAPI {
  // INPUTS

  /**
   * Type of the symbol
   * @input
  */
  type: string;
  /**
   * Real time data stream from PI
   */
  data: any;
  layout: any;
  params: any;
  props: any;
  msconfig: any;
  mobile: boolean;
  editMode: boolean;
  /**
   * zoom value
   */
  zoom: number;
  /**
   * the Date object for current cursor time
   */
  cursorTime: Date;
  /**
   * true if current symbol is selected
   */
  selected: boolean;
  /**
   * A list of items that are highlighted
   */
  highlightItems: string[];
  /**
   * A list of AF Elements
   */
  elements: string[];
  handleIndex: number;
  /**
   * True if handle is highlighted
   */
  highlightHandle: boolean;
  /**
   * Trace indices that are highlighted
   */
  highlightIndices: number[];

  // OUTPUTS

  /**
   * The resizing event
   * @output
   */
  resizing: EventEmitter<any>;
  /**
   * Emit the event if symbol needs to be refreshed
   */
  refresh: EventEmitter<boolean>;
  /**
   * Emit the event if cursor needs to be updated
   */
  updateCursor: EventEmitter<any>;
  /**
   * Event to select current symbol
   */
  select: EventEmitter<any>;
  /**
   * Event to update the span
   */
  updateSpan: EventEmitter<any>;
  /**
   * Event to update the handles
   */
  updateHandles: EventEmitter<any>;
  /**
   * Event to add handles
   */
  addHandles: EventEmitter<any>;
  /**
   * Fire an embed action such as
   * Initializing a symbol, changing time range,
   * toggling ER Element, refresh symbol, or refresh the display
   */
  embedAction: EventEmitter<any>;
}

export interface ExtConfigComponent extends OnChanges {
  paramIndex: number;
  selectedSymbols: any[];
  changeLayout: EventEmitter<any>;
  changeParam: EventEmitter<any>;
}

export interface ExtJSSymbol {
  onChanges(changes: any);
}

/**
 * Base class for the extensibile plug in library
 * @abstract
 */
export abstract class ExtPluginLibrary {
  /**
   * Array of extensible symbols
   * @abstract
   */
  abstract symbols: ExtSymbolType[];

  /**
   * Extensibility version number
   * @readonly
   */
  readonly version = EXT_VERSION_NUM;
}

/**
 * Angular class for extensible library
 * @abstract
 */
export abstract class ExtNgPluginLibrary extends ExtPluginLibrary {
  abstract module: any;
  abstract moduleFactory: any;
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

/**
 * Default settings when initializing an Angular extensibility symbol.
 * @const
 */
export const NgSymbolTypeDefaults: any = {
  /**
   * Defaults to having a card style layout
   */
  hasCardLayout: true,
  /**
   * Defaults to have only one layout
   */
  multipleLayout: false,
  /**
   * Defaults to using PI Vision display time
   */
  setDefaultTime: true,
  /**
   * Defaults to having a configuration UI
   */
  noConfigUI: false,
  /**
   * By default the symbol is implemented in Angular
   */
  isAngular: true,
  /**
   * By defualt the symbol falls into the display category
   */
  categories: [DISPLAY_CATEGORY],
  sysProps: [],
  customProps: [],
  configProps: []
};

export const JSSymbolTypeDefaults: any = {
  hasCardLayout: true,
  multipleLayout: false,
  setDefaultTime: true,
  noConfigUI: false,
  isAngular: false,
  categories: [ DISPLAY_CATEGORY ],
  sysProps: [],
  customProps: [],
  configProps: []
};

/**
 * System level property enumeration type.
 * Each system property maps to a system level input in ExtSymbolAPI
 * E.g. SysPropType.CursorTime maps to cursorTime @Input in your component
 */
export const enum SysPropType {
  /**
   * Adding this property indicates the symbol requested certain columns for data summary
   */
  Columns,
  /**
   * This property let's PI Vision know the symbol needs the Date object
   * when dropping a cursor on the symbol
   */
  CursorTime,
  /**
   * Real time data from PI
   */
  Data,
  /**
   * The data mode (e.g. snapshot)
   */
  DataMode,
  /**
   * Add this property if symbol needs to know if display is
   * in edit mode
   */
  EditMode,
  /**
   * This selected handle in the config UI
   */
  HandleIndex,
  /**
   * This allows symbol to know indices of highlighted data items
   */
  HighlightIndices,
  /**
  * The markup text of a graphic-style symbol
  */
  Markup,
  /**
   * The path prefix. This is useful if you need to add
   * images to your symbol
   */
  PathPrefix,
  /**
   * Data shape of the symbol
   */
  Shape,
  /**
   * Add this if you are interested in the type of the symbol
   */
  Type,
  /**
   * An object with the collection of dynamic handle properties
   * set to their configured values before multi-state values are set
   */
  Handles,
  /**
   * A flag indicating if HandleIndex should be highlighted
   */
  HighlightHandle,
  /**
   * Add this to sysProps if symbol needs to know whether
   * it is selected
   */
  Selected,
  /**
   * An object with the collection of all multi-state enabled properties
   * set to their current values, useful when using dynmic properties (handles)
   */
  MSData,
  /**
   * An array of dynamic (handle) properties
   */
  HandlePropConfigs
}

// Can't make this const because we need to assign it to a local property in order to use it in component template
/**
 * Enumeration for different configuration property types
 * @enum
 */
export enum ConfigPropType {
  /**
   * Color configuration property
   */
  Color,
  /**
   * Number configuration property
   */
  Num,
  /**
   * String configuration property
   */
  Text,
  /**
   * Boolean configuration property
   */
  Flag,
  /**
   * Url configuration property
   */
  Url,
  /**
   * Document URL configuration property
   */
  DocumentUrl,
  /**
   * Modify Columns from configuration UI
   */
  Columns,
  /**
   * Set the Text alignment style
   */
  TextAlign,
  /**
   * Data source input from configuration UI
   */
  Datasource,
  /**
   * Custom config property
   */
  Custom
}

/**
 * Base property definition
 */
export interface BasePropDef {
  inputAlias?: string;
}

/**
 * Definition for a system level property
 * @interface
 */
export interface SystemPropDef extends BasePropDef {
  /**
   * the system level property type
   */
  sysType: SysPropType;
}

/**
 * Definition for a custom property
 */
export interface CustomPropDef extends BasePropDef {
  /**
   * name of the property
   */
  propName: string;
  /**
   * default values for the custom property
   */
  defaultVal?: any;
}

/**
 * The configuration property definition
 * @interface
 */
export interface ConfigPropDef extends CustomPropDef {
  /**
   * name to be displayed on configuration UI
   */
  displayName: string;
  /**
   * configuration property type
   */
  configType: ConfigPropType;
  /**
   * minimum value for the configuration property
   */
  min?: number;
  /**
   * maximum value for the configuration property
   */
  max?: number;
  /**
   * Set to true if the symbol is a multistate symbol
   */
  isMultiState?: boolean;
  /**
   * Set to true if this is a required configuration property
   */
  required?: boolean;
}

/**
 * Base class for extensible symbols.
 * @abstract
 */
export abstract class ExtBaseType {
  /**
   * The internal name of the symbol.
   */
  public name: string;

  /**
   * The name of the symbol that will be displayed to the end user.
   */
  public displayName: string;
  /**
   * The thumbnail for the extensible symbol
   */
  public thumbnail: string;
  /**
   * Specifies the Angular component name of this symbol
   */
  public compCtor: any;
  /**
   * Categories that the symbol falls under
   */
  public categories?: string[];
  /**
   * A flag to indicate if implemented in Angular
   */
  public isAngular?: boolean;
}

/**
 * Parameters to configure symbol data
 * @interface
 */
export interface DataParams {
  /**
   * The data shape of the symbol
   * E.g. 'single' means symbol takes just one data point or stream
   */
  shape?: string;
  /**
   * Specify the columns to show for summary data
   * E.g. ['Average', 'Total'] indicates the symbol needs average and total
   * of some data stream
   */
  columns?: string[];
  /**
   * The data mode. For example, 'snapshot' means the symbol will take
   * snapshot data as input
   */
  dataMode?: string;
}

/**
 * Extensible Symbol type.
 * Each symbol must be declared by creating an object of this type.
 * This object lets PI Vision know that this symbol exists, what to call it,
 * which component to create, what configuration properties does the symbol require,
 * how to query for PI data, and how it interacts with the rest of the application.
 * @class
 */
export class ExtSymbolType extends ExtBaseType {
  /**
   * Parameters to configure symbol data
   */
  dataParams?: DataParams;
  /**
   * The outputs for the symbol
   * Outputs can be one or more of these strings:
   * 'updateSpan', 'zoomIn', 'updateCursor', 'addHandles', 'action', 'updateHandles', 'changeSymbol', 'navigate'
   */
  autoEventBindings?: string[];
  /**
   * Set to true if the symbol has card layout
   */
  hasCardLayout?: boolean;
  /**
   * Set to true if the symbol has multiple layout
   */
  multipleLayout?: boolean;
  /**
   * Set to true if using default time. The default time is usually
   * a global time for a given display or document
   */
  setDefaultTime?: boolean;
  /**
   * Set the default layout (width, height etc.)
   */
  defaultLayout?: any;
  /**
   * A function which will be called when creating a brand new symbol
   * or when changing symbol from one type to another to do the clean up
   */
  onSetDefaults?: (model: any) => boolean;
  /**
   * A function that will be called when layout should be updated
   */
  onLayout?: (model: any, initial: boolean, numVertical: number, numHorizontal: number, snap: (num: number) => number) => any;
  onInit?: (comp: any, api: ExtSymbolAPI) => any;
  configCtors?: any[];
  /**
   * Set to true if the symbol doesn't need a configuration UI
   */
  noConfigUI?: boolean;
  /**
   * Initial width of the symbol
   */
  layoutWidth: number;
  /**
   * Initial height of the symbol
   */
  layoutHeight: number;

  /**
   * An array of system level properties to be used in the symbol.
   * These properties can then be sent to your symbol component as multiple
   * @Input variables.
   * See SysPropType for definition of each system property
   */
  sysProps?: Array<SystemPropDef | SysPropType>;
  /**
   * An array of custom properties
   */
  customProps?: CustomPropDef[];
  /**
   * An array of configuration properties that PI Vision will render
   * UI for you and allow user input. These config properties can then
   * be sent to symbol component as multipel @Input variables
   */
  configProps?: ConfigPropDef[];

  /**
   * Creates the extensible symbol object
   */
  constructor() {
    super();
    Object.assign(this, NgSymbolTypeDefaults);
  }
}

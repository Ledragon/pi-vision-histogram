import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtNgPluginLibrary, ExtSymbolType, SysPropType, ConfigPropType } from './ext.types';
import { LibModuleNgFactory } from './aot/module.ngfactory';

import { ExampleComponent } from './example/example.component';

@NgModule({
  declarations: [ ExampleComponent ],
  imports: [ CommonModule ] ,
  exports: [ ExampleComponent ],
  entryComponents: [ ExampleComponent ]
})
export class LibModule { }

export class PluginLibrary extends ExtNgPluginLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: ExtSymbolType[] = [
    {
      name: 'example-symbol',
      displayName: 'Example Plug-in Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExampleComponent,
      sysProps: [
        SysPropType.Data,
        SysPropType.PathPrefix
      ],
      configProps: [
        { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
        { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];
}

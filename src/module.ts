import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';
import { NameComponent } from './name/name.component';

@NgModule({
  declarations: [ExampleComponent, NameComponent],
  imports: [CommonModule],
  exports: [ExampleComponent, NameComponent],
  entryComponents: [ExampleComponent, NameComponent]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'example-symbol',
      displayName: 'Example Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExampleComponent,
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
      layoutWidth: 200,
      layoutHeight: 100
    },
    {
      name: 'name-symbol',
      displayName: 'Name symbol',
      compCtor: NameComponent,
      dataParams: { shape: 'trend' },
      inputs: [
        SymbolInputType.Data
      ],
      thumbnail: '^/assets/images/example.svg',
      generalConfig: [
        {
          name: 'Options',
          isExpanded: true,
          configProps: [
            { propName: 'color', displayName: 'Text color', configType: ConfigPropType.Color, defaultVal: 'blue' }
          ]
        }
      ],
      layoutHeight: 50,
      layoutWidth: 100
    }
  ];
}

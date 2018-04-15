import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';
import { HistogramComponent } from './histogram/histogram.component';

@NgModule({
  declarations: [ExampleComponent, HistogramComponent],
  imports: [CommonModule],
  exports: [ExampleComponent, HistogramComponent],
  entryComponents: [ExampleComponent, HistogramComponent]
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
      name: 'histogram-symbol',
      displayName: 'Histogram symbol',
      compCtor: HistogramComponent,
      dataParams: { shape: 'trend' },
      inputs: [
        SymbolInputType.Data
      ],
      thumbnail: '^/assets/images/histogram.jpg',
      generalConfig: [
        {
          name: 'Options',
          isExpanded: true,
          configProps: [
            { propName: 'bins', displayName: 'Bins', configType: ConfigPropType.Num, defaultVal: 10 }
          ]
        }
      ],
      layoutHeight: 300,
      layoutWidth: 400
    }
  ];
}

/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { ExampleComponent } from './example.component';

describe('ExampleComponent', function () {
  
  it('should format data', () => {
    let comp = new ExampleComponent();
    expect(comp.formatData()).toEqual([{}]);

    comp.data = {};
    expect(comp.formatData()).toEqual([{}]);

    comp.data = { body: [] };
    expect(comp.formatData()).toEqual([{}]);

    let myData = [{ path: 'my path', value: 42 }];
    comp.data = { body: myData };
    expect(comp.formatData()).toEqual(myData);
  });

});

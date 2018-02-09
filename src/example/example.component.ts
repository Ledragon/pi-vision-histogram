/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'example',
  templateUrl: 'example.component.html',
  styleUrls: ['example.component.css']
})
export class ExampleComponent implements OnChanges {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  values: any[];

  ngOnChanges(changes) {
    if (changes.data) {
      this.values = this.formatData();
    }
  }

  formatData() {
    if (this.isDataValid()) {
      return this.data.body.map(r => ({ path: r.path, value: this.formatValue(r.value) }));
    } else {
      return [];
    }
  }

  private formatValue(value: any) {
    // very basic enumeration support
    if (value.Name) {
      return value.Name;
    }

    return value;
  }

  private isDataValid(): boolean {
    return this.data && this.data.body && this.data.body.length;
  }

  private formatInfo() {
    let output = '';
    this.data.body.forEach(item => {
      output += item.path + '\n';
      output += item.timestamp + '\n';
      output += item.type + '\n';
      output += (item.good ? 'good' : 'bad') + ' data\n------------\n';
    });

    return output;
  }
}

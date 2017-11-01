import { Component, Input, OnChanges } from '@angular/core';

@Component({
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

  formatData(): any[] {
    if (!this.data || !this.data.body || this.data.body.length === 0) {
      return [{}];
    } else {
      return this.data.body;
    }
  }
}

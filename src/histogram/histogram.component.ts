import {
    Component, OnInit, Input, OnChanges, SimpleChanges,
    ElementRef
} from '@angular/core';
import { Histogram } from './histogram.chart';

import { select } from 'd3';

@Component({
    selector: 'histogram',
    templateUrl: 'histogram.component.html',
    styleUrls: ['./histogram.component.css']
})

export class HistogramComponent implements OnInit, OnChanges {

    _histogram: Histogram;
    @Input() color: string;
    @Input() data: any;
    events: any[];
    constructor(private _element: ElementRef) {
        this._histogram = new Histogram()
        .bins(10);
    }

    ngOnInit() {
        this.events = [];
        this._histogram.init(select(this._element.nativeElement));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            // console.log(changes.data.currentValue);
            if(changes.data.currentValue && changes.data.currentValue.body)
            {
                this._histogram.update(changes.data.currentValue.body);
            }
        }
    }
}
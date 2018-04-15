import {
    Component, OnInit, Input, OnChanges, SimpleChanges,
    ElementRef
} from '@angular/core';
import { Histogram } from './histogram.chart';

import elementResizeDetector from 'element-resize-detector';

@Component({
    selector: 'histogram',
    templateUrl: 'histogram.component.html',
    styleUrls: ['./histogram.component.css']
})

export class HistogramComponent implements OnInit, OnChanges {

    _histogram: Histogram;
    @Input() color: string;
    @Input() bins: number;
    @Input() yAxisVisible: boolean;
    @Input() data: any;
    events: any[];
    constructor(private _element: ElementRef) {
        this._histogram = new Histogram()
            .bins(10);
    }

    ngOnInit() {
        elementResizeDetector()
            .listenTo(this._element.nativeElement.parentElement, elt => {
                // console.log(elt.clientWidth, elt.clientHeight);
                this._histogram.width(elt.clientWidth)
                    .height(elt.clientHeight);
                if (this.data && this.data.body) {
                    this._histogram.update(this.data.body);
                }
            })
        this.events = [];
        this._histogram.init(this._element.nativeElement)
            .bins(this.bins ? this.bins : 10);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            // console.log(changes.data.currentValue);
            if (changes.data.currentValue && changes.data.currentValue.body) {
                this._histogram.update(changes.data.currentValue.body);
            }
        } else if (changes.bins && changes.bins.currentValue) {
            this._histogram.bins(changes.bins.currentValue as number);
            if (this.data) {
                this._histogram.update(this.data.body);
            }
        } else if (changes.yAxisVisible) {
            this._histogram.yAxisVisible(changes.yAxisVisible.currentValue)
        }
    }
}
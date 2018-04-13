import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'histogram',
    templateUrl: 'histogram.component.html',
    styleUrls: ['./histogram.component.css']
})

export class HistogramComponent implements OnInit, OnChanges {

    @Input() color: string;
    @Input() data: any;
    events: any[];
    constructor() { }

    ngOnInit() {
        this.events = [];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data) {
            console.log(changes.data.currentValue);
            this.events = changes.data.currentValue.body[0].events;
        }
    }
}
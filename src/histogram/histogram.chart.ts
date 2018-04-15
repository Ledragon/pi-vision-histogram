import * as d3 from 'd3';

interface Event {
    timestamp: string,
    value: number
}
interface Formatted {
    color: string;
    path: string;
    step: number,
    lengths: number[];
    xMin: number;
    xMax: number;
    bins: d3.Bin<Event, number>[];
}

export class Histogram {

    _plotMargins: { top: number; bottom: number; left: number; right: number; };
    _elt: HTMLElement;
    _yAxisVisible: boolean;
    _histogram: d3.HistogramGenerator<Event, number>;
    _plotHeight: number;
    _plotWidth: number;
    _plotGroup: d3.Selection<d3.BaseType, any, any, any>;
    constructor() {
        this._width = 400;
        this._height = 300;
        this._histogram = d3.histogram<Event, number>()
            .value(d => d.value);
    }
    private _width: number;
    width(): number;
    width(value: number): this;
    width(value?: number): this | number {
        if (value) {
            this._width = value;
            return this;
        }
        return this._width;
    }

    private _height: number;
    height(): number;
    height(value: number): this;
    height(value?: number): this | number {
        if (value) {
            this._height = value;
            return this;
        }
        return this._height;
    }

    private _bins: number;
    bins(): number;
    bins(value: number): this;
    bins(value?: number): this | number {
        if (value) {
            this._bins = value;
            this._histogram.thresholds(value);
            return this;
        }
        return this._bins;
    }

    yAxisVisible(value?: boolean) {
        this._yAxisVisible = !!value;
        this._plotGroup.selectAll('.y.axis')
            .style('display', !!value ? 'visible' : 'hidden');

    }

    init(elt: HTMLElement): this {
        this._elt = elt;

        this._plotMargins = {
            top: 10,
            bottom: 0,
            left: 0,
            right: 0
        };

        let svg = d3.select(elt)
            .append('svg')
            .attr('width', this.width())
            .attr('height', this.height());

        this._plotGroup = svg.append('g')
            .classed('plot', true)
            .attr('transform', `translate(${this._plotMargins.left},${this._plotMargins.top})`);
        return this;
    }

    private updateSizes() {
        this._plotWidth = this.width() - this._plotMargins.left - this._plotMargins.right;
        this._plotHeight = this.height() - this._plotMargins.top - this._plotMargins.bottom;

        d3.select(this._elt)
            .select('svg')
            .attr('height', this.height())
            .attr('width', this.width());
    }

    update(data: { color: string, events: Event[], path: string, step: number }[]) {
        if (this._plotGroup) {

            this.updateSizes();
            let bins = data.map(d => {
                let binned = this._histogram(d.events);
                let lengths = binned.map(b => b.length);
                return {
                    color: d.color,
                    bins: binned,
                    path: d.path,
                    step: d.step,
                    lengths,
                    xMin: d3.min(binned, b => b.x0),
                    xMax: d3.max(binned, b => b.x1),
                }
            });

            var histogramBound = this._plotGroup.selectAll('.histogram')
                .data(bins);
            histogramBound
                .exit()
                .remove();
            let height = this._plotHeight / bins.length;
            var enterHistogram = histogramBound
                .enter()
                .append('g')
                .classed('histogram', true);
            enterHistogram.append('text')
                .classed('title', true)
                .attr('y', 15)
                .attr('dy', '.35em');
            let plotMargins = {
                top: 30,
                bottom: 20,
                left: 40,
                right: 40
            };
            let plotGroup = enterHistogram.append('g')
                .classed('plot', true)
                .attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);
            let width = this._plotWidth;
            let plotWidth = width - plotMargins.left - plotMargins.right;
            let plotHeight = height - plotMargins.top - plotMargins.bottom;

            let xAxisGroup = plotGroup.append('g')
                .classed('x', true)
                .classed('axis', true)

            let yAxisGroup = plotGroup.append('g')
                .classed('y', true)
                .classed('axis', true)
                .style('display', !!this._yAxisVisible ? 'visible' : 'hidden')

            let barsGroup = plotGroup.append('g')
                .classed('bars', true);

            let merged = histogramBound.merge(enterHistogram);
            merged.select('.x.Axis')
                .attr('transform', (d, i) => `translate(${0},${plotHeight})`);
            merged.select('.histogram')
                .attr('transform', (d, i) => `translate(${0},${i * height})`);
            merged.select('.title')
                .attr('x', this.width() / 2)
                .text(d => d.path.split('\\').reverse()[0]);

            this.plot(merged, plotWidth, plotHeight);
        }
    }

    private plot(histograms: d3.Selection<d3.BaseType, Formatted, d3.BaseType, any>,
        width: number, height: number) {
        var self = this;
        let plotsGroup = histograms.select('.plot')
            .each(function (d, i) {
                self.bars(d3.select(this), d, width, height);
            });
    }

    private bars(plotGroup: d3.Selection<d3.BaseType, Formatted, d3.BaseType, any>, formatted: Formatted, width: number, height: number) {
        let barsGroup = plotGroup.select('.bars');

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(formatted.lengths)])
            .range([height, 0])
            .nice();
        let yAxis = d3.axisLeft(yScale)
            .ticks(5);
        plotGroup.select('.y.axis')
            .call(yAxis);
        let xScale = d3.scaleLinear()
            .domain([formatted.xMin, formatted.xMax])
            .range([0, width]);
        let xAxis = d3.axisBottom(xScale)
            .ticks(5);
        plotGroup.select('.x.axis')
            .call(xAxis);
        var dataBound = barsGroup.selectAll('.bar')
            .data(d => d.bins);
        dataBound
            .exit()
            .remove();
        var enterSelection = dataBound
            .enter()
            .append('g')
            .classed('bar', true);
        dataBound.merge(enterSelection)
            .attr('transform', (d, i) => `translate(${xScale(d.x0)},${0})`);
        var rect = enterSelection.append('rect')
            .style('stroke', 'none');
        let bandWidth = width / this._bins * .8;
        barsGroup
            .selectAll('rect')
            .attr('x', 0)
            .attr('y', (d: any) => {
                return height - yScale(d.length);
            })
            .attr('width', bandWidth)
            .attr('height', (d: any) => yScale(d.length))
            .style('fill', formatted.color);
    }
}
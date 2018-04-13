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

    init(selection: d3.Selection<HTMLDivElement, any, any, any>): this {
        console.log(selection.node());
        // this.width(selection.node().clientWidth)
        //     .height(selection.node().clientHeight);
        let svg = selection
            .append('svg')
            .attr('width', this.width())
            .attr('height', this.height());

        let plotMargins = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
        this._plotGroup = svg.append('g')
            .classed('plot', true)
            .attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);

        this._plotWidth = this.width() - plotMargins.left - plotMargins.right;
        this._plotHeight = this.height() - plotMargins.top - plotMargins.bottom;
        return this;
    }

    update(data: { color: string, events: Event[], path: string, step: number }[]) {
        if (this._plotGroup) {
            let bins = data.map(d => {
                let binned = this._histogram(d.events);
                let lengths = binned.map(b => b.length);//[].concat(binned.map(d => d.map(b => b.length)));
                return {
                    color: d.color,
                    bins: binned,//this._histogram(d.events),
                    path: d.path,
                    step: d.step,
                    lengths,
                    xMin: d3.min(binned, b => b.x0),
                    xMax: d3.max(binned, b => b.x1),
                }
            });
            // console.log(bins);

            var histogramBound = this._plotGroup.selectAll('.histogram')
                .data(bins);
            histogramBound
                .exit()
                .remove();
            let height = this._plotHeight / bins.length;
            var enterHistogram = histogramBound
                .enter()
                .append('g')
                .classed('histogram', true)
                .attr('transform', (d, i) => `translate(${0},${i * height})`);
            enterHistogram.append('text')
                .classed('title', true)
                .attr('x', this.width() / 2)
                .attr('y', 12)
                .attr('dy', '.35em')
                .style('text-anchor', 'middle');
            let plotMargins = {
                top: 30,
                bottom: 20,
                left: 20,
                right: 20
            };
            let plotGroup = enterHistogram.append('g')
                .classed('plot', true)
                .attr('transform', `translate(${plotMargins.left},${plotMargins.top})`);
            let width = this._plotWidth;
            let plotWidth = width - plotMargins.left - plotMargins.right;
            let plotHeight = height - plotMargins.top - plotMargins.bottom;

            // this._histogram.domain(xScale.domain() as [number, number])
            //     .thresholds(xScale.ticks(this._bins));

            let xAxisGroup = plotGroup.append('g')
                .classed('x', true)
                .classed('axis', true)
                .attr('transform', (d, i) => `translate(${0},${plotHeight})`)
            // .call(xAxis);

            // let yAxis = d3.axisLeft(yScale);
            // let yAxisGroup = plotGroup.append('g')
            //     .classed('axis', true)
            //     .call(yAxis);

            let barsGroup = plotGroup.append('g')
                .classed('bars', true);

            // console.log([].concat(...dataBound.merge(enterSelection).select('.plot').data().map(d => d.bins.map(b => b.length))));
            let merged = histogramBound.merge(enterHistogram);
            merged.select('.title')
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

        // plotGroup.select('.bars')
        //     .select('rect')
    }

    private bars(plotGroup: d3.Selection<d3.BaseType, Formatted, d3.BaseType, any>, formatted: Formatted, width: number, height: number) {
        // console.log(plotGroup.data());
        // plotGroup.select('.title')
        let barsGroup = plotGroup.select('.bars');

        // console.log(...barsGroup.data().map(d => d.bins.map(b => b.length))); 
        // let lengths = [].concat(...barsGroup.data().map(d => d.bins.map(b => b.length)));
        // let x0s = [].concat(...barsGroup.data().map(d => d.bins.map(b => b.x0)));
        // let x1s = [].concat(...barsGroup.data().map(d => d.bins.map(b => b.x1)));
        // console.log(lengths);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(formatted.lengths)])
            // .domain([0, d3.max(barsGroup.data().map(d => d.bins.length))])
            .range([height, 0])
            .nice();
        // yScale
        //     .nice();
        let xScale = d3.scaleLinear()
            .domain([formatted.xMin, formatted.xMax])
            .range([0, width])
            .nice();
        let xAxis = d3.axisBottom(xScale);
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
        barsGroup
            .selectAll('rect')
            .attr('x', 0)
            .attr('y', (d: any) => {
                // console.log(d);
                return height - yScale(d.length);
            })
            .attr('width', width / this._bins)
            .attr('height', (d: any) => yScale(d.length))
            .style('fill', formatted.color);
        console.log(formatted)
    }
}
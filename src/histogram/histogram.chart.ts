import * as d3 from 'd3';

interface Event {
    timestamp: string,
    value: number
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

    update(data: { color: string, events: Event[] }[]) {
        if (this._plotGroup) {
            let bins = data.map(d => {
                return {
                    color: d.color,
                    bins: this._histogram(d.events)
                }
            });
            // console.log(bins);

            var dataBound = this._plotGroup.selectAll('.histogram')
                .data(bins);
            dataBound
                .exit()
                .remove();
            let height = this._plotHeight / bins.length;
            var enterSelection = dataBound
                .enter()
                .append('g')
                .classed('histogram', true)
                .attr('transform', (d, i) => `translate(${0},${i * height})`);
            let plotMargins = {
                top: 30,
                bottom: 30,
                left: 30,
                right: 30
            };
            let plotGroup = enterSelection.append('g')
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

            this.plot(dataBound.merge(enterSelection), plotWidth, plotHeight);
        }
    }

    private plot(histograms: d3.Selection<d3.BaseType, { color: string, bins: d3.Bin<Event, number>[] }, d3.BaseType, any>,
        width: number, height: number) {


            let plotsGroup = histograms.select('.plot');
            let barsGroup=plotsGroup.select('.bars');
        console.log(...barsGroup.data().map(d => d.bins.map(b => b.length))); 
        let lengths = [].concat(...barsGroup.data().map(d => d.bins.map(b => b.length)));
        let yScale = d3.scaleLinear()
                .domain([0, d3.max(lengths)])
                // .domain([0, d3.max(barsGroup.data().map(d => d.bins.length))])
                .range([height, 0])
                .nice();
        // yScale
        //     .nice();
        let xScale = d3.scaleLinear()
            .domain([0, this._bins])
            .range([0, width]);
        let xAxis = d3.axisBottom(xScale);
        var dataBound = barsGroup.selectAll('.bar')
            .data(d => {
                return d.bins;
                // console.log(d);
                // // return {}
                // return d.bins.map(s => {
                //     return {
                //         color: d.color,
                //         length: s.length
                //     }
                // })
            });
        dataBound
            .exit()
            .remove();
        var enterSelection = dataBound
            .enter()
            .append('g')
            .classed('bar', true)
            .attr('transform', (d, i) => `translate(${xScale(i)},${0})`);
        var rect = enterSelection.append('rect')
            .attr('x', 0)
            .style('stroke', 'none');
        dataBound.merge(enterSelection)
            .selectAll('rect')
            .attr('y', (d: any) => {
                // console.log(d);
                return height - yScale(d.length);
            })
            .attr('width', width / this._bins)
            .attr('height', (d: any) => yScale(d.length))
            .style('fill', (d: any) => d.color);
        // plotGroup.select('.bars')
        //     .select('rect')
    }
}
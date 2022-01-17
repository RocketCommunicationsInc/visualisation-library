import { Component, h, Prop, State, Watch } from '@stencil/core'
import { Point, Bounds } from '../../models/graph.model'

@Component({
    tag: 'my-graph',
    styleUrl: 'my-graph.scss',
    shadow: true,
})
export class MyGraph {
    @Prop() points: Point[]

    @State() container = {
        width: 1000,
        height: 350,
        spasing: 10,
    }
    @State() computedPoints!: Point[]

    @Watch('points')
    onPoinstUpdated(newVal: Point[]) {
        this._pointsChanged(newVal)
    }

    constructor() {
        console.log('graph')
        this._pointsChanged(this.points)
    }

    // componentWillLoad() {
    //     console.log('componentWillLoad')
    //     const { points, name } = this
    //     console.log('this', { points, name })
    // }

    // componentDidLoad() {
    //     console.log('componentDidLoad')
    //     const { points, name } = this
    //     console.log('this', { points, name })
    // }

    // componentDidUpdate() {
    //     console.log('componentDidUpdate')
    //     const { points, name } = this
    //     console.log('this', { points, name })
    // }

    private _pointsChanged(points: Point[]) {
        const { maxX, maxY, minX, minY }: Bounds = this._getBounds(points)
        const { width, height, spasing } = this.container

        const scaleX = this._createLinearScale(
            [minX, maxX],
            [spasing, width - spasing]
        )
        const scaleY = this._createLinearScale(
            [minY, maxY],
            [height - spasing, spasing]
        )

        this.computedPoints = [
            ...points.map((point) => ({
                x: scaleX(point.x),
                y: scaleY(point.y),
            })),
        ]
    }

    private _createLinearScale(
        domain: [number, number],
        range: [number, number]
    ) {
        const [minDomain, maxDomain] = domain
        const [minRange, maxRange] = range
        const sizeOfDomain = maxDomain - minDomain
        const sizeOfRange = maxRange - minRange

        return function scale(value: number) {
            const positionInDomain = (value - minDomain) / sizeOfDomain
            return positionInDomain * sizeOfRange + minRange
        }
    }

    private _getBounds(points: Point[]): Bounds {
        const { x, y } = points[0]
        return points.reduce(
            (acc: Bounds, curr: Point) => {
                if (acc.maxX < curr.x) {
                    acc.maxX = curr.x
                }
                if (curr.x < acc.minX) {
                    acc.minX = curr.x
                }
                if (acc.maxY < curr.y) {
                    acc.maxY = curr.y
                }
                if (curr.y < acc.minY) {
                    acc.minY = curr.y
                }
                return acc
            },
            { minX: x, maxX: x, minY: y, maxY: y }
        )
    }

    private _getPathCommandsForLine(points: Point[]): string {
        const { minX, maxY } = this._getBounds(points)
        const move = `M ${minX - this.container.spasing},${
            maxY + this.container.spasing
        }`
        const lines = points.map((point) => `L ${point.x},${point.y}`)
        return `${move} ${lines.join(' ')}`
    }

    private _getAreaUnderCurve(points: Point[]): string {
        const { maxX, maxY } = this._getBounds(points)
        const path =
            this._getPathCommandsForLine(points) +
            `L ${maxX + this.container.spasing}, ${
                maxY + this.container.spasing
            }Z`
        return path
    }

    // private __opposedline(pointA: Point, pointB: Point): { length: number; angle: number } {
    //   const lengthX = pointB.x - pointA.x;
    //   const lengthY = pointB.y - pointA.y;
    //   return {
    //     length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    //     angle: Math.atan2(lengthY, lengthX),
    //   };
    // }

    // private __controlPoint(current: Point, previous: Point, next: Point, reverse: boolean = false): Point {
    //   const p = previous || current;
    //   const n = next || current;
    //   const smoothing = 0.2;
    //   const o = this.__opposedline(p, n);
    //   const angle = o.angle + (reverse ? Math.PI : 0);
    //   const length = o.length * smoothing;
    //   const x = current.x + Math.cos(angle) * length;
    //   const y = current.y + Math.sin(angle) * length;
    //   return { x, y };
    // }

    // private __bezier = (point: Point, i: number, a: Point[]) => {
    //   const cps = this.__controlPoint(a[i - 1], a[i - 2], point);
    //   const cpe = this.__controlPoint(point, a[i - 1], a[i + 1], true);

    //   return `C ${cps.x},${cps.x} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
    // };

    private drawPoints = (points: Point[]) =>
        points.map((p: Point) => (
            <circle class="graph__point" r="4" cy={p.y} cx={p.x}></circle>
        ))

    private drawLine = (points: Point[]) => (
        <path class="graph__line" d={this._getPathCommandsForLine(points)} />
    )

    private drawCoordinates = (points: Point[]) => {
        const { minX, minY, maxX, maxY }: Bounds = this._getBounds(points)
        const { spasing } = this.container
        return (
            <path
                class="graph__coordinates"
                d={`M ${minX - spasing},${minY - spasing} L ${minX - spasing},${
                    maxY + spasing
                } L${maxX + spasing},${maxY + spasing}`}
            />
        )
    }

    private drawGraphBg = (points: Point[]) => {
        return <path class="graph__bg" d={this._getAreaUnderCurve(points)} />
    }

    private drawXaxisLabels = () => {
        // const pointsBounds = this._getBounds(this.points)
        // const coordinatesBounds = this._getBounds(this.computedPoints)

        return this.computedPoints.map((p: Point, index: number) => (
            <text
                class="graph__labels graph__labels--xaxis"
                stroke="red"
                y={this.container.height + 10}
                x={p.x}
            >
                {this.points[index].x}
            </text>
        ))
    }

    render() {
        console.log('graph render')
        return (
            <svg
                viewBox={`0 0 ${this.container.width + 15} ${
                    this.container.height + 15
                }`}
                xmlns="http://www.w3.org/2000/svg"
                class="graph"
            >
                {/* <defs>
                    <pattern
                        id="smallGrid"
                        width="8"
                        height="8"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 8 0 L 0 0 0 8"
                            fill="none"
                            stroke="gray"
                            stroke-width="0.5"
                        />
                    </pattern>
                    <pattern
                        id="grid"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width="80" height="80" fill="url(#smallGrid)" />
                        <path
                            d="M 80 0 L 0 0 0 80"
                            fill="none"
                            stroke="gray"
                            stroke-width="0.5"
                        />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" /> */}

                <defs>
                    <linearGradient id="bgGradient" x2="1" y2="1">
                        <stop offset="0%" stop-color="var(--gradient-stop)" />
                        <stop offset="50%" stop-color="var(--gradient-stop)" />
                        <stop
                            offset="100%"
                            stop-color="var(--gradient-start)"
                        />
                    </linearGradient>
                </defs>
                <g id="line">{this.drawLine(this.computedPoints)}</g>
                <g id="lineBg">{this.drawGraphBg(this.computedPoints)}</g>
                <g id="points">{this.drawPoints(this.computedPoints)}</g>
                <g id="coordinates">
                    {this.drawCoordinates(this.computedPoints)}
                </g>
                <g id="xLabels">{this.drawXaxisLabels()}</g>
            </svg>
        )
    }
}

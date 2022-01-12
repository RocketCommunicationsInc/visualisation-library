import { Component, h, Prop, State, Watch } from '@stencil/core'

@Component({
    tag: 'my-pie-chart',
    styleUrl: 'my-pie-chart.scss',
    shadow: true,
})
export class MyPieChart {
    @Prop() name: string = ''

    @State() container = {
        width: 250,
        height: 250,
    }

    render() {
        return (
            <svg
                viewBox={`0 0 ${this.container.width} ${this.container.height}`}
                xmlns="http://www.w3.org/2000/svg"
                class="pie-chart"
            ></svg>
        )
    }
}

import { Component, h, Prop, State } from '@stencil/core'

interface DonutSlice {
    id: number
    percent: number
    color: string
    label?: string
}

interface DonutSliceWithCommands extends DonutSlice {
    offset: number // This is the offset that we will use to rotate the slices
    commands: string // This will be what goes inside the d attribute of the path tag
}

@Component({
    tag: 'my-pie-chart',
    styleUrl: 'my-pie-chart.scss',
    shadow: true,
})
export class MyPieChart {
    @Prop() type: 'pie' | 'donut' = 'pie'

    @State() container = {
        width: 600,
        height: 600,
    }

    @Prop() data: {
        id: number
        percent: number
        color: string
        label?: string
    }[] = [
        {
            id: 1,
            percent: 35,
            color: 'DarkSeaGreen',
            label: 'Slice 1',
        },
        {
            id: 2,
            percent: 15,
            color: 'DarkOrchid',
            label: 'Slice 2',
        },
        {
            id: 3,
            percent: 22,
            color: 'DodgerBlue',
            label: 'Slice 3',
        },
    ]

    @Prop() radius: number = 50
    @Prop() viewBox: number = 100
    @Prop() borderSize: number = 50

    private __getSlicesWithCommandsAndOffsets(
        donutSlices: DonutSlice[],
        radius: number,
        svgSize: number,
        borderSize: number
    ): DonutSliceWithCommands[] {
        let previousPercent = 0
        return donutSlices.map((slice) => {
            const sliceWithCommands: DonutSliceWithCommands = {
                ...slice,
                commands: this.__getSliceCommands(
                    slice,
                    radius,
                    svgSize,
                    borderSize
                ),
                offset: previousPercent * 3.6 * -1,
            }
            previousPercent += slice.percent
            return sliceWithCommands
        })
    }

    private __getSliceCommands(
        donutSlice: DonutSlice,
        radius: number,
        svgSize: number,
        borderSize: number
    ): string {
        const degrees = this.__percentToDegrees(donutSlice.percent)
        const longPathFlag = degrees > 180 ? 1 : 0
        const innerRadius = radius - borderSize

        const commands: string[] = []
        commands.push(`M ${svgSize / 2 + radius} ${svgSize / 2}`)
        commands.push(
            `A ${radius} ${radius} 0 ${longPathFlag} 0 ${this.__getCoordFromDegrees(
                degrees,
                radius,
                svgSize
            )}`
        )
        commands.push(
            `L ${this.__getCoordFromDegrees(degrees, innerRadius, svgSize)}`
        )
        commands.push(
            `A ${innerRadius} ${innerRadius} 0 ${longPathFlag} 1 ${
                svgSize / 2 + innerRadius
            } ${svgSize / 2}`
        )
        return commands.join(' ')
    }

    private __getCoordFromDegrees(
        angle: number,
        radius: number,
        svgSize: number
    ): string {
        const x = Math.cos((angle * Math.PI) / 180)
        const y = Math.sin((angle * Math.PI) / 180)
        const coordX = x * radius + svgSize / 2
        const coordY = y * -radius + svgSize / 2
        return [coordX, coordY].join(' ')
    }

    private __percentToDegrees(percent: number): number {
        return percent * 3.6
    }

    render() {
        const { data, viewBox, radius, borderSize } = this
        return (
            data && (
                <svg viewBox={'0 0 ' + viewBox + ' ' + viewBox}>
                    {this.__getSlicesWithCommandsAndOffsets(
                        data,
                        radius,
                        viewBox,
                        borderSize
                    ).map((slice) => (
                        <path
                            fill={slice.color}
                            d={slice.commands}
                            transform={'rotate(' + slice.offset + ')'}
                        >
                            <title>{slice.label}</title>
                        </path>
                    ))}
                </svg>
            )
        )
    }
}

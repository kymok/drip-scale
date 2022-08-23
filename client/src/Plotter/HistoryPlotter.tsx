import React, { useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import * as d3 from 'd3'
import * as d3Shape from 'd3-shape'
import { daqModeStateStringSelector, triggerState } from '../DataAcquisitionHandler/daqModeStates'
import * as Styled from '../Style/contentArea'
import * as InputElement from '../Style/inputElements'
import { PlottableHistoryDataPoint, PlottableHistory, PlottableReference } from '.'
import { ReferenceCurveDataPoint } from '../ReferenceCurveEditor/referenceCurveStates'

const splitHistoryByNoDataPeriod = (history: PlottableHistoryDataPoint[], threshold = 2000) => {
    const gapIndices = history.map((e, i): [boolean, number] => [(e.dt ?? NaN) > threshold, i]).filter((e) => e[0]).map((e) => e[1])
    const sliceStarts = [0, ...gapIndices]
    const sliceEnds = [...gapIndices, history.length]
    const splittedHistory = sliceStarts.map((_, i) => {
        const sliceStart = sliceStarts[i]
        const sliceEnd = sliceEnds[i]
        return history.slice(sliceStart, sliceEnd)
    })
    return splittedHistory
}

type Margin = {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
}

const getX = ({
    width,
    margin,
    plotAreaMargin,
    xDomain
}: {
    width: number,
    margin: Margin,
    plotAreaMargin: Margin,
    xDomain: [number, number]
}) => {
    const x = d3.scaleLinear()
        .range([
            0 + (margin.left ?? 0) + (plotAreaMargin.left ?? 0),
            width - (margin.right ?? 0) - (plotAreaMargin.right ?? 0)])
        .domain(xDomain)
    return x
}

export const HistoryPlotter = ({
    title = '',
    historyData = [],
    referenceData = [],
    duration = 0,
    width = 600,
    height = 200,
    margin = { top: 2, bottom: 2, left: 2, right: 2 },
    plotAreaMargin = { top: 16, left: 20 },
    xSpan = 400_000,
    triggerPosition = 30_000,
    yDomain = [0, 500]
}: {
    title: string,
    historyData: PlottableHistory[],
    referenceData?: PlottableReference[],
    duration?: number,
    width?: number,
    height?: number,
    margin?: Margin,
    plotAreaMargin?: Margin,
    xSpan?: number,
    triggerPosition?: number,
    yDomain?: [number, number]
}) => {
    const d3Container = useRef<HTMLDivElement | null>(null)
    const pixelRatio = 2
    const scaledWidth = width * pixelRatio
    const scaledHeight = height * pixelRatio
    const trigger = useRecoilValue(triggerState)
    const lastTimestamp = historyData.map((e) => e.data.map((datapoint) => datapoint.timestamp)).flatMap(e => e).reduce((a, b) => a > b ? a : b, 0)
    const acquisitionMode = useRecoilValue(daqModeStateStringSelector)
    const triggerModeOriginTimestamp = trigger.timestamp ?? (trigger.standby ? Date.now() : undefined)
    const filenameTimestamp = triggerModeOriginTimestamp ?? Date.now()

    useEffect(() => {
        if (d3Container.current) {
            const container = d3.select(d3Container.current)
            container.append('canvas')
                .attr('width', scaledWidth)
                .attr('height', scaledHeight)
                .style('width', width + 'px')
                .style('height', height + 'px')
                .attr('class', 'canvas')
            return () => {
                container.select('.canvas').remove()
            }
        }
    }, [d3Container, height, width, scaledHeight, scaledWidth])

    useEffect(() => {
        const canvas = d3.select(d3Container.current).select<HTMLCanvasElement>('.canvas')
        const context = canvas?.node()?.getContext('2d')
        if (!context) {
            return
        }

        // Initialize
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.scale(pixelRatio, pixelRatio) // for Retina
        context.clearRect(0, 0, width, height)
        context.lineCap = 'round'
        context.lineJoin = 'round'

        // X axis range
        let xDomain: [number, number]
        if (triggerModeOriginTimestamp) {
            const dataDuration = (lastTimestamp - triggerModeOriginTimestamp)
            const plotDuration = Math.max(dataDuration, duration * 1000)
            const span = Math.max(plotDuration + triggerPosition + 30_000, xSpan)
            const xRangeStart = triggerModeOriginTimestamp - triggerPosition
            const xRangeEnd = xRangeStart + span
            xDomain = [xRangeStart, xRangeEnd]
        } else {
            const now = Date.now()
            xDomain = [now - xSpan, now]
        }

        // Axes
        const x = getX({ width, margin, plotAreaMargin, xDomain })
        const y = d3.scaleLinear()
            .range([
                height - (margin.left ?? 0) - (plotAreaMargin.bottom ?? 0),
                0 + (margin.top ?? 0) + (plotAreaMargin.top ?? 0)])
            .domain(yDomain)
        y.clamp(true)

        // Plot line
        const historyPlotLine = d3Shape.line<PlottableHistoryDataPoint>()
            .x((d) => x(d.timestamp))
            .y((d) => y(d.value || NaN))
            .context(context)

        // Tick
        const tickLine = ({
            value,
            direction = 'x',
            tickColor = '#ddd',
            labelColor = '#999',
            labelBackgroundColor = '#ddd',
            lineWidth = 1,
            label = undefined,
            cursorBackground = false
        }: {
            value: number,
            direction: 'x' | 'y',
            tickColor?: string,
            labelColor?: string,
            labelBackgroundColor?: string,
            lineWidth?: number,
            label?: string | undefined,
            cursorBackground?: boolean
        }) => {
            context.lineWidth = lineWidth
            context.strokeStyle = tickColor
            context.beginPath()
            if (direction === 'x') {
                context.moveTo(margin.left ?? 0, y(value))
                context.lineTo(width - (margin.right ?? 0), y(value))
            } else if (direction === 'y') {
                context.moveTo(x(value), margin.top ?? 0)
                context.lineTo(x(value), height - (margin.bottom ?? 0))
            }
            context.stroke()

            if (label) {
                context.font = '14px sans-serif'
                const textWidth = context.measureText(label).width
                // background
                if (cursorBackground) {
                    context.fillStyle = labelBackgroundColor
                    if (direction === 'y') {
                        context.fillRect(x(value), (margin.top ?? 0) - lineWidth / 2, textWidth + 4, 14 + lineWidth / 2)
                    }
                }
                // text
                context.fillStyle = labelColor
                if (direction === 'x') {
                    context.fillText(label, (margin.left ?? 0), y(value) - 2)
                } else if (direction === 'y') {
                    context.fillText(label, x(value) + 2, (margin.top ?? 0) + 12)
                }
            }
        }

        // Draw Y Axis Ticks
        const yTicks = y.ticks(4)
        yTicks.forEach((d) => {
            tickLine({ value: d, label: d.toString(), direction: 'x' })
        })

        // Draw X Axis Ticks
        if (triggerModeOriginTimestamp) {
            // Trigger mode
            const xDomainMinute = x.domain().map((e: number) => (e - triggerModeOriginTimestamp!) / 60000)
            const nTicks = Math.floor(xDomainMinute[1]) + 1
            const xTicks = Array.from(Array(nTicks).keys())
            xTicks.forEach((d) => {
                const min = Math.floor(d).toString()
                const sec = (Math.floor(d % 1) * 60).toString().padStart(2, '0')
                const label = `${min}:${sec}`
                tickLine({ value: d * 60000 + triggerModeOriginTimestamp!, label, direction: 'y' })
            })
        } else {
            // Freerun mode
            const tickStart = Math.floor(x.domain()[0] / 60000) * 60000
            const tickEnd = Math.floor(x.domain()[1] / 60000) * 60000
            const nTicks = ((tickEnd - tickStart) / 60000 + 1) || 1
            const xTicks = Array.from(Array(nTicks).keys()).map((e) => e * 60000 + tickStart)
            xTicks.forEach((d) => {
                const date = new Date(d)
                const label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
                tickLine({ value: d, label, direction: 'y' })
            })
        }

        // Draw Reference Curve
        if (triggerModeOriginTimestamp) {
            const referencePlotLine = d3Shape.line<ReferenceCurveDataPoint>()
                .x((d) => x(d.dt * 1000 + triggerModeOriginTimestamp))
                .y((d) => y(d.value))
                .context(context)
            referenceData.forEach((e) => {
                if (e.data) {
                    if (e.type === 'curve') {
                        context.lineWidth = 2
                        context.strokeStyle = e.color
                        context.beginPath()
                        referencePlotLine(e.data)
                        context.stroke()
                    } else if (e.type === 'limit') {
                        context.lineWidth = 2
                        context.setLineDash([5, 3])
                        context.strokeStyle = e.color
                        context.beginPath()
                        context.moveTo(x.range()[0], y(e.data))
                        context.lineTo(x.range()[1], y(e.data))
                        context.stroke()
                        context.setLineDash([])
                    }
                }
            })
        }

        // Draw Data
        context.lineWidth = 2
        historyData.forEach((e) => {
            context.strokeStyle = e.color
            if (e.data) {
                splitHistoryByNoDataPeriod(e.data).forEach(e => {
                    context.beginPath()
                    historyPlotLine(e)
                    context.stroke()
                })
            }
        })

        // Draw Trigger Marker
        if (acquisitionMode === 'triggered') {
            const markerColor = '#2fed6f99'
            const markerFillColor = '#2fed6f'
            const elapsedTime = lastTimestamp - triggerModeOriginTimestamp!
            const min = Math.floor(elapsedTime / 60000).toString()
            const sec = (Math.floor(elapsedTime / 1000) % 60).toString().padStart(2, '0')
            tickLine({ value: lastTimestamp, label: `${min}:${sec}`, direction: 'y', cursorBackground: true, tickColor: markerColor, labelColor: '#000', labelBackgroundColor: markerFillColor })
        }
    }, [d3Container, height, width, scaledHeight, scaledWidth, historyData, referenceData, trigger, margin, plotAreaMargin, lastTimestamp, xSpan, triggerPosition, yDomain, duration, acquisitionMode, triggerModeOriginTimestamp])

    const generateDownloadUrl = () => {
        if (d3Container.current) {
            const canvas = d3Container.current.getElementsByClassName('canvas')[0]
            if (!canvas) {
                return undefined
            }
            const url = (canvas as HTMLCanvasElement).toDataURL('image/png')
            return url
        }
        return undefined
    }

    const handleDownload = () => {
        if (d3Container.current) {
            const url = generateDownloadUrl()
            const link = document.createElement('a')
            link.className = 'plot-download-hidden'

            const date = new Date(filenameTimestamp)
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
            const dateString = localDate.toISOString().slice(0, 19).replaceAll('T', '_').replaceAll(':', '.')

            link.download = `${title || 'plot'}_${dateString}.png`
            if (url) {
                link.href = url
                link.click()
            }
        }
    }

    return (
        <Styled.LabelledPlotArea label={title}>
            <div ref={d3Container} />
            <Styled.PlotControls>
                <InputElement.LabelledButtonCluster>
                    <InputElement.SmallButton onClick={handleDownload}>Download Plot</InputElement.SmallButton>
                </InputElement.LabelledButtonCluster>
            </Styled.PlotControls>
        </Styled.LabelledPlotArea>
    )
}


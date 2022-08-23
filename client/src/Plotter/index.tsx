import React from 'react'
import { useRecoilValue } from 'recoil'
import { plottableHistorySelector } from "../DataAcquisitionHandler/plottableHistory"
import { currentReferenceCurveSelector } from "../ReferenceCurveEditor/referenceCurveOptionSelectors"
import { HistoryPlotter } from './HistoryPlotter'
import * as Styled from '../Style/contentArea'
import { ReferenceCurveDataPoint } from '../ReferenceCurveEditor/referenceCurveStates'

export type PlottableHistoryDataPoint = {
    timestamp: number,
    value: number,
    dt: number
}
export type PlottableHistory = {
    data: PlottableHistoryDataPoint[]
    color: string
}
export type PlottableReferenceCurve = {
    data: ReferenceCurveDataPoint[],
    color: string,
    type: 'curve'
}
export type PlottableReferenceLimit = {
    data: number,
    color: string,
    type: 'limit'
}
export type PlottableReference = PlottableReferenceCurve | PlottableReferenceLimit

const WeightPlot = () => {
    const historyW1 = useRecoilValue(plottableHistorySelector('W1')).map((e) => ({ timestamp:e.timestamp, value: e.reading, dt: e.dt }))
    const historyW2 = useRecoilValue(plottableHistorySelector('W2')).map((e) => ({ timestamp:e.timestamp, value: e.reading, dt: e.dt }))

    // Reference curve
    const referenceCurves = useRecoilValue(currentReferenceCurveSelector)
    const duration = referenceCurves?.duration

    // y Domain
    const findReferenceCurveMaxOrZero = (curve: ReferenceCurveDataPoint[] | undefined) => curve?.map((e) => e.value)?.reduce((a, b) => a > b ? a : b, 0) || 0
    let weightMax = findReferenceCurveMaxOrZero(referenceCurves?.pourCurve)
    weightMax = Math.max(weightMax, findReferenceCurveMaxOrZero(referenceCurves?.extractCurve) ?? 0)
    weightMax = Math.max(weightMax, referenceCurves?.pourLimit ?? 0)
    weightMax = Math.max(weightMax, referenceCurves?.extractLimit ?? 0)
    const weightYDomain: [number, number] = [0, weightMax * 1.2 || 400]

    const plotData = [
        { data: historyW1, color: 'rgba(200,150,80,1)' },
        { data: historyW2, color: 'rgba(64,68,70,1)' }
    ]

    const referenceData = [
        { data: referenceCurves?.pourCurve, color: 'rgba(224,201,157,1)', type: 'curve' },
        { data: referenceCurves?.extractCurve, color: 'rgba(192,204,210,1)', type: 'curve' },
        { data: referenceCurves?.pourLimit, color: 'rgba(224,201,157,.5)', type: 'limit' },
        { data: referenceCurves?.extractLimit, color: 'rgba(192,204,210,.5)', type: 'limit' }
    ].filter((e):e is PlottableReference => {
        if (e.type === 'curve') {
            return !!e.data
        } else {
            return !!e || e === 0
        }
    })

    // line data
    return (
        <HistoryPlotter title={'Weight'} historyData={plotData} referenceData={referenceData} yDomain={weightYDomain} height={300} duration={duration}/>
    )
}

const PourRatePlot = () => {
    const referenceCurves = useRecoilValue(currentReferenceCurveSelector)
    const duration = referenceCurves?.duration
    const historyW1 = useRecoilValue(plottableHistorySelector('W1'))
        .map((e) => ({ timestamp:e.timestamp, value: e.derivative, dt: e.dt }))
        .filter((e):e is PlottableHistoryDataPoint => {
            if (e.value || e.value === 0) {
                return true
            }
            return false
        })
    const historyW2 = useRecoilValue(plottableHistorySelector('W2'))
        .map((e) => ({ timestamp:e.timestamp, value: e.derivative, dt: e.dt }))
        .filter((e):e is PlottableHistoryDataPoint => {
            if (e.value || e.value === 0) {
                return true
            }
            return false
        })
    const plotData = [
        { data: historyW1, color: 'rgba(200,150,80,1)' },
        { data: historyW2, color: 'rgba(64,68,70,1)' }
    ]
    return (
        <HistoryPlotter title={'Pour Rate'} historyData={plotData} height={100} yDomain={[-5, 25]} duration={duration} />
    )
}

const TemperaturePlot = () => {
    const referenceCurves = useRecoilValue(currentReferenceCurveSelector)
    const duration = referenceCurves?.duration
    const historyT1 = useRecoilValue(plottableHistorySelector('T1')).map((e) => ({ timestamp:e.timestamp ?? NaN, value: e.reading ?? NaN, dt: e.dt ?? NaN }))
    const plotData = [
        { data: historyT1, color: 'rgba(200,150,80,1)' }
    ]
    return (
        <HistoryPlotter title={'Temperature'} historyData={plotData} height={100} yDomain={[65, 105]} duration={duration}/>
    )
}

export const Plotter = () => {
    return (
        <div>
            <Styled.Category label={'Live Plots'}>
                <WeightPlot />
                <PourRatePlot />
                <TemperaturePlot />
            </Styled.Category>
        </div>
    )
}

import { selectorFamily } from 'recoil'
import { calibratorSelector, derivativeCalibratorSelector } from './calibrator'
import { fastHistoryState, HistoryDataPoint, slowHistoryState } from './history'

const calibratedSlowHistorySelector = selectorFamily({
    key: 'calibratedSlowHistorySelector',
    get: (sensorId: string) => ({ get }): HistoryDataPoint[] | undefined => {
        const data = get(slowHistoryState)[sensorId]
        if (data) {
            const calibrate = get(calibratorSelector(sensorId))
            const calibrateDerivative = get(derivativeCalibratorSelector(sensorId))
            return data.map((e) => {
                const result = { ...e, reading: calibrate(e.reading) }
                if (e.derivative) {
                    result.derivative = calibrateDerivative(e.derivative)
                }
                return result
            })
        } else {
            return undefined
        }
    }
})

export const calibratedLatestFastAverageDataSelector = selectorFamily({
    key: 'calibratedLatestFastAverageDataSelector',
    get: (sensorId: string) => ({ get }): HistoryDataPoint | undefined => {
        const history = get(fastHistoryState)[sensorId]
        const latestData = history?.at(-1)
        if (latestData) {
            const calibrate = get(calibratorSelector(sensorId))
            const calibrateDerivative = get(derivativeCalibratorSelector(sensorId))
            const result = { ...latestData, reading: calibrate(latestData.reading) }
            if (latestData.derivative) {
                result.derivative = calibrateDerivative(latestData.derivative)
            }
            return result
        } else {
            return undefined
        }
    }
})

export const plottableHistorySelector = selectorFamily({
    key: 'plottableHistorySelector',
    get: (sensorId: string) => ({ get }): HistoryDataPoint[] => {
        const slowHistory = get(calibratedSlowHistorySelector(sensorId)) || []
        const fastLatestData = get(calibratedLatestFastAverageDataSelector(sensorId))
        const dt = (slowHistory?.at(-1)?.timestamp || NaN) - (fastLatestData?.timestamp || NaN)
        if (fastLatestData) {
            return [...slowHistory, {...fastLatestData, dt}]
        } else {
            return [...slowHistory]
        }
    }
})
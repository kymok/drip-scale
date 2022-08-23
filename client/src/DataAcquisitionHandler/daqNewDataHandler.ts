import { useRecoilCallback } from 'recoil'
import { pauseState, slowHistoryRetainPeriod } from './daqModeStates'
import { findTemporalBinStartTimestamp, leastSquare, truncateSortedDataBeforeTimestamp } from './daqUtils'
import { fastHistoryState, HistoryDataPoint, RawDataPoint, rawHistoryState, slowHistoryState } from './history'
import { sensorPropertiesState } from './sensorProperties'
import { autoStop, tare, trigger } from './daqModeSubroutines'

type IntermediateDataPoint = RawDataPoint & { derivative? : number }

export const useAddNewData = () => {
    const addNewFastAverageData = useAddNewFastAverageData()
    return useRecoilCallback(({ snapshot, set }) => async (newData: RawDataPoint) => {
        // Pause
        const pause = await snapshot.getPromise(pauseState)
        if (pause.isPaused) {
            return
        }
        const sensorId = newData.sensorId
        const history = await snapshot.getPromise(rawHistoryState)
        const sensorHistory = history[sensorId] || []
        const sensorProperty = (await snapshot.getPromise(sensorPropertiesState))[sensorId]
        const binningCycle = sensorProperty.fastSamplingIntervalMs
        const binSize = sensorProperty.fastAveragingWindowSizeMs
        const shouldComputeDerivative = sensorProperty.type === 'weight'

        const lastTimestamp = sensorHistory?.at(-1)?.timestamp
        if (lastTimestamp) {
            const lastBinStart = findTemporalBinStartTimestamp(lastTimestamp, binningCycle, binSize)
            const newBinStart = findTemporalBinStartTimestamp(newData.timestamp, binningCycle, binSize)
            if (lastBinStart !== newBinStart) {
                const X = sensorHistory.map((e) => (e.timestamp - lastBinStart) / 1000)
                const Y = sensorHistory.map((e) => e.reading)
                const average = Y.reduce((a, b) => (a + b), 0) / sensorHistory.length

                const newAverageData: IntermediateDataPoint = {
                    sensorId,
                    timestamp: lastBinStart + binSize / 2,
                    reading: average,
                }
                if (shouldComputeDerivative) {
                    const { b } = leastSquare(X, Y)
                    newAverageData.derivative = b
                }
                await addNewFastAverageData(newAverageData)
            }
        }
        const limitTimestamp = newData.timestamp - binSize
        let newRawSensorHistory = [...sensorHistory, newData]
        newRawSensorHistory = truncateSortedDataBeforeTimestamp(newRawSensorHistory, limitTimestamp)
        const newHistory = { ...history, [sensorId]: newRawSensorHistory }
        set(rawHistoryState, newHistory)
    }, [])
}

const useAddNewFastAverageData = () => {
    const addNewSlowAverageData = useAddNewSlowAverageData()
    return useRecoilCallback(({ snapshot, set }) => async (newData: IntermediateDataPoint) => {
        const pause = await snapshot.getPromise(pauseState)
        if (pause.isPaused) {
            return
        }
        const sensorId = newData.sensorId
        const shouldAutostop = await autoStop(snapshot, sensorId, set)
        if (shouldAutostop) {
            return
        }
        await tare(snapshot, sensorId, set)
        await trigger(snapshot, sensorId, set)

        // History
        const history = await snapshot.getPromise(fastHistoryState)
        const sensorHistory = history[sensorId] || []

        // Data processing properties
        const sensorProperties = await snapshot.getPromise(sensorPropertiesState)
        const binningCycle = sensorProperties[sensorId].slowSamplingIntervalMs
        const binSize = sensorProperties[sensorId].slowSamplingIntervalMs
        const shouldComputeDerivative = sensorProperties[sensorId].type === 'weight'

        // Do averaging and append the average to average history
        // if last and latest data belong to different temporal bins
        const lastTimestamp = sensorHistory?.at(-1)?.timestamp || NaN
        if (lastTimestamp) {
            const lastBinStart = findTemporalBinStartTimestamp(lastTimestamp, binningCycle, binSize)
            const newBinStart = findTemporalBinStartTimestamp(newData.timestamp, binningCycle, binSize)
            if (lastBinStart !== newBinStart) { // New temporal bin
                const lastBinData = truncateSortedDataBeforeTimestamp(sensorHistory, lastBinStart)

                // compute average and derivative
                const X = lastBinData.map((e) => (e.timestamp - lastBinStart) / 1000) // sec
                const Y = lastBinData.map((e) => e.reading)
                let average = Y.reduce((a, b) => (a + b), 0)
                average = average / lastBinData.length

                const data:IntermediateDataPoint = {
                    sensorId,
                    timestamp: lastBinStart + binSize / 2,
                    reading: average
                }
                if (shouldComputeDerivative) {
                    const { b } = leastSquare(X, Y)
                    data.derivative = b
                }

                // write data
                await addNewSlowAverageData(data)
            }
        }

        // Truncate data outside retain period and write new history
        const historyRetainPeriod = sensorProperties[sensorId].fastHistoryRetainPeriodMs
        const limitTimestamp = newData.timestamp - historyRetainPeriod
        const newHistoryData: HistoryDataPoint = {...newData, dt: newData.timestamp - lastTimestamp}
        let newSensorHistory = [...sensorHistory, newHistoryData]
        newSensorHistory = truncateSortedDataBeforeTimestamp(newSensorHistory, limitTimestamp)
        const newHistory = { ...history }
        newHistory[sensorId] = newSensorHistory
        set(fastHistoryState, newHistory)
    }, [])
}

const useAddNewSlowAverageData = () => {
    return useRecoilCallback(({ snapshot, set }) => async (newData: IntermediateDataPoint) => {
        const sensorId = newData.sensorId
        const history = await snapshot.getPromise(slowHistoryState)
        const sensorHistory = history[sensorId] || []

        // Append dt for plot blanking on pause
        const lastTimestamp = sensorHistory.at(-1)?.timestamp || NaN
        const newHistoryData: HistoryDataPoint = { ...newData, dt: newData.timestamp - lastTimestamp }
        let newSensorHistory = [...sensorHistory, newHistoryData]

        // Truncate history within retain period
        const historyRetainPeriod = await snapshot.getPromise(slowHistoryRetainPeriod)
        const limitTimestamp = newData.timestamp - historyRetainPeriod
        newSensorHistory = truncateSortedDataBeforeTimestamp(newSensorHistory, limitTimestamp)
        const newHistory = { ...history }
        newHistory[sensorId] = newSensorHistory
        set(slowHistoryState, newHistory)
    }, [])
}



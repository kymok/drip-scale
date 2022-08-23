import { selectorFamily } from 'recoil'
import { truncateSortedDataBeforeTimestamp } from './daqUtils'
import { rawHistoryState, fastHistoryState, slowHistoryState } from './history'

export const latestRawDataSelector = selectorFamily({
    key: 'latestRawDataSelector',
    get: (sensorId: string) => ({ get }) => {
        const history = get(rawHistoryState)[sensorId]
        return history?.at(-1)
    }
})

export const latestFastAverageDataSelector = selectorFamily({
    key: 'latestFastAverageDataSelector',
    get: (sensorId: string) => ({ get }) => {
        const history = get(fastHistoryState)[sensorId]
        return history?.at(-1)
    }
})

export const latestSlowAverageDataSelector = selectorFamily({
    key: 'latestSlowAverageDataSelector',
    get: (sensorId: string) => ({ get }) => {
        const history = get(slowHistoryState)[sensorId]
        return history?.at(-1)
    }
})

export const latestNMSecFastAverageDataSelector = selectorFamily({
    key: 'lastNMsecFastAverageDataSelector',
    get: ({ sensorId, msec }:{ sensorId: string, msec: number }) => ({ get }) => {
        const history = get(fastHistoryState)[sensorId]
        if (history) {
            const lastTimestamp = history.at(-1)?.timestamp || NaN
            return truncateSortedDataBeforeTimestamp(history, lastTimestamp - msec)
        }
        return null
    }
})

import { atom, selector } from 'recoil'

export type RawDataPoint = {
    sensorId: string,
    reading: number,
    timestamp: number
}

export type HistoryDataPoint = {
    sensorId: string,
    timestamp: EpochTimeStamp,
    reading: number,
    dt: number
    derivative?: number,
}

type RawHistory = Record<string, RawDataPoint[]>
type History = Record<string, HistoryDataPoint[]>

export const rawHistoryState = atom({
    key: 'rawDataState',
    default: {
    } as RawHistory
})

export const fastHistoryState = atom({
    key: 'fastHistoryState',
    default: {
    } as History
})

export const slowHistoryState = atom({
    key: 'slowHistoryState',
    default: {
    } as History
})

export const clearHistory = selector({
    key: 'clearHistory',
    get: () => {
        return null
    },
    set: ({ reset }) => {
        reset(rawHistoryState)
        reset(fastHistoryState)
        reset(slowHistoryState)
    }
})
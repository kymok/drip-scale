import { bisectLeft } from "../utils"
import { HistoryDataPoint, RawDataPoint } from "./history"

export const leastSquare = (
    X: number[],
    Y: number[]
): { a?: number, b?: number } => {
    // ensure data length are same
    if (X.length !== Y.length) {
        return {}
    }
    const n = X.length
    const meanX = X.reduce((a, b) => a + b, 0) / n
    const meanY = Y.reduce((a, b) => a + b, 0) / n
    const varX = X.map((xi) => (xi - meanX) * (xi - meanX)).reduce((a, b) => a + b, 0)
    const covarXY = X.map((_, i) => (X[i] - meanX) * (Y[i] - meanY)).reduce((a, b) => a + b, 0)
    // y = a + bx
    const b = covarXY / varX
    const a = meanY - b * meanX
    return { a, b }
}

export function truncateSortedDataBeforeTimestamp (data: HistoryDataPoint[], timestamp: EpochTimeStamp): HistoryDataPoint[]
export function truncateSortedDataBeforeTimestamp (data: RawDataPoint[], timestamp: EpochTimeStamp): RawDataPoint[]
export function truncateSortedDataBeforeTimestamp (data: (HistoryDataPoint | RawDataPoint)[], timestamp: EpochTimeStamp) {
    const index = bisectLeft(data.map((e) => e.timestamp), timestamp)
    return data.slice(index)
}

export const findTemporalBinStartTimestamp = (timestamp: EpochTimeStamp, binningCycle: number, binSize: number) => {
    return Math.ceil(timestamp / binningCycle) * binningCycle - binSize
}
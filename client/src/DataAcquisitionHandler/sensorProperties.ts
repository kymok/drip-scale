import { atom } from 'recoil'

type LinearCalibrationOptions = { offset: number, scale: number }

type SensorProperty = {
    type: 'weight' | 'temperature',
    displayName: string,
    displayUnit: string,
    calibrationOptions: LinearCalibrationOptions
    fastSamplingIntervalMs: number,
    fastAveragingWindowSizeMs: number,
    fastHistoryRetainPeriodMs: number,
    slowSamplingIntervalMs: number
}

export const sensorPropertiesState = atom({
    key: 'sensorPropertiesState',
    default: {
        W1: {
            type: 'weight',
            displayName: 'Total Weight',
            displayUnit: 'g',
            calibrationOptions: { offset: 0, scale: 1 },
            fastSamplingIntervalMs: 100,
            fastAveragingWindowSizeMs: 200,
            fastHistoryRetainPeriodMs: 1000,
            slowSamplingIntervalMs: 1000
        },
        W2: {
            type: 'weight',
            displayName: 'Extraction Weight',
            displayUnit: 'g',
            calibrationOptions: { offset: 0, scale: 1 },
            fastSamplingIntervalMs: 100,
            fastAveragingWindowSizeMs: 200,
            fastHistoryRetainPeriodMs: 1000,
            slowSamplingIntervalMs: 1000
        },
        T1: {
            type: 'temperature',
            displayName: 'Temperature 1',
            displayUnit: '°C',
            calibrationOptions: { offset: 0, scale: 1 },
            fastSamplingIntervalMs: 200,
            fastAveragingWindowSizeMs: 200,
            fastHistoryRetainPeriodMs: 1000,
            slowSamplingIntervalMs: 1000
        }
    } as Record<string, SensorProperty>
})

import { atom, selector } from 'recoil'
import { dataSourceState } from '../DataReceiver/dataSourceStates'

type TriggerStatus = {
    channel: string,
    threshold: number,
    nConsecutiveSamples: number,
    triggerWindowSize: number,
    standby: boolean,
    timestamp: number | null
}

export const triggerState = atom({
    key: 'triggerState',
    default: {
        channel: 'W1',
        threshold: 2.0,
        nConsecutiveSamples: 2,
        triggerWindowSize: 400,
        standby: true, // default to trigger mode
        timestamp: null
    } as TriggerStatus
})

type TareStatus = {
    shouldTare: boolean,
    sampleLengthMs: number,
    stddev: number
}

export type TareState = Record<string, TareStatus>

export const tareState = atom({
    key: 'tareState',
    default: {
        W1: {
            shouldTare: true, // Tare on page load
            sampleLengthMs: 2_000,
            stddev: 0.2
        },
        W2: {
            shouldTare: true, // Tare on page load
            sampleLengthMs: 2_000,
            stddev: 0.2
        }
    } as TareState
})

export type PauseState = {
    isPaused: boolean,
    reason: 'user' | 'autostop' | undefined
}

export const pauseState = atom({
    key: 'pauseState',
    default: {
        isPaused: false,
        reason: undefined
    } as PauseState
})

export const slowHistoryRetainPeriod = atom({
    key: 'slowHistoryRetainPeriod',
    default: 600_000
})

export type AcquisitionStatus = 'disconnected' | 'tare' | 'standby' | 'triggered' | 'freerun' | 'stop' | 'autostop'

export const daqModeStateStringSelector = selector({
    key: 'appStateStringSelector',
    get: ({ get }): AcquisitionStatus => {
        const isConnected = get(dataSourceState).isActive
        const trigger = get(triggerState)
        const pause = get(pauseState)
        const tare = get(tareState)

        let triggerStateString:AcquisitionStatus = 'freerun'

        // disconnected
        if (!isConnected) {
            triggerStateString = 'disconnected'
            return triggerStateString
        }

        // trigger
        if (trigger.standby) {
            triggerStateString = 'standby'
        } else if (trigger.timestamp) {
            triggerStateString = 'triggered'
        }

        // tare
        const shouldTare = Object.keys(tare).map((sensorId) => tare[sensorId].shouldTare).reduce((a, b) => a ?? b)
        if (shouldTare) {
            triggerStateString = 'tare'
        }

        // pause
        if (pause.isPaused) {
            if (pause.reason === 'user') {
                triggerStateString = 'stop'
            } else if (pause.reason === 'autostop') {
                triggerStateString = 'autostop'
            }
        }
        return triggerStateString
    }
})

import { atom } from 'recoil'

// Data Sources

export type DataSourceType = 'serial' | 'websocket' | 'demo'
export type DataSourceStateType = {
    source: DataSourceType
    isActive: boolean
}

export const dataSourceState = atom({
    key: 'dataSourceState',
    default: {
        source: 'serial',
        isActive: false
    } as DataSourceStateType
})

type WebSocketDataSourceStateType = {
    url: string
}

export const webSocketDataSourceState = atom({
    key: 'webSocketDataSourceState',
    default: {
        url: 'ws://localhost:8000'
    } as WebSocketDataSourceStateType
})

type WebSerialDataSourceStateType = {
    port: SerialPort | null,
    baudRate: number,
    dataBits: number | undefined,
    parity: ParityType | undefined,
    stopBits: number | undefined,
    flowControl: FlowControlType | undefined
}

export const webSerialDataSourceState = atom({
    key: 'webSerialDataSourceState',
    default: {
        port: null,
        baudRate: 115200,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: 'none'
    } as WebSerialDataSourceStateType
})

type DemoDataSourceStateType = {
    samplingInterval: number,
    lookAheadMs: number,
    mode: 'standby' | 'curveTracing',
    pourRatePrecisionPercent: number,
    pourStartTimestamp: number | undefined
    pourRate: number,
    pourWeight: number,
    elapsedTimeMs: number,
    extractWeight: number
}

export const demoDataGeneratorPropertiesState = atom({
    key: 'demoDataSourceState',
    default: {
        samplingInterval: 20,
        lookAheadMs: 2_000,
        mode: 'standby',
        pourRatePrecisionPercent: 50.0,
        pourStartTimestamp: undefined,
        elapsedTimeMs: 0,
        pourRate: 0,
        pourWeight: 0,
        extractWeight: 0
    } as DemoDataSourceStateType
})
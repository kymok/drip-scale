import { useEffect, useRef } from 'react'
import { useSetRecoilState, useRecoilValue } from 'recoil'
import { pauseState } from '../DataAcquisitionHandler/daqModeStates'
import { dataSourceState, DataSourceStateType, webSerialDataSourceState } from './dataSourceStates'
import { useAddNewData } from '../DataAcquisitionHandler/daqNewDataHandler'

class LineBreakTransformer {
    container: string = ''
    constructor() {
        this.container = ''
    }
    transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        this.container += chunk
        const lines = this.container?.split('\r\n') || ''
        this.container = lines.pop() || ''
        lines.forEach(line => controller.enqueue(line))
    }
    flush(controller: TransformStreamDefaultController<string>) {
        controller.enqueue(this.container)
    }
}

export const WebSerialConnectionHandler = () => {
    const setDataSource = useSetRecoilState(dataSourceState)
    const webSerialDataSource = useRecoilValue(webSerialDataSourceState)
    const setPause = useSetRecoilState(pauseState)
    const addNewData = useAddNewData()

    const addDataRef = useRef<Function>(() => {})
    useEffect(() => {
        addDataRef.current = addNewData
    }, [addNewData])
    const setPauseRef = useRef<Function>(() => {})
    useEffect(() => {
        setPauseRef.current = setPause
    }, [setPause])
    const setDataSourceRef = useRef<Function>(() => {})
    useEffect(() => {
        setDataSourceRef.current = setDataSource
    }, [setDataSource])

    // Serial connection
    useEffect(() => {
        let reader: ReadableStreamDefaultReader
        const readFromPort = async (port: SerialPort) => {
            try {
                await port.open({
                    baudRate: webSerialDataSource.baudRate,
                    dataBits: webSerialDataSource.dataBits,
                    parity: webSerialDataSource.parity,
                    stopBits: webSerialDataSource.stopBits,
                    flowControl: webSerialDataSource.flowControl
                })
                if (setDataSourceRef.current) {
                    setDataSourceRef.current((current:DataSourceStateType) => ({ ...current, isActive: true }))
                }
            } catch (e) {
                console.error(e)
                if (setDataSourceRef.current) {
                    setDataSourceRef.current((current:DataSourceStateType) => ({ ...current, isActive: false }))
                }
            }

            while (port?.readable) {
                // eslint-disable-next-line no-undef
                const textDecoder = new TextDecoderStream()
                const readableStream = port.readable.pipeTo(textDecoder.writable)

                // eslint-disable-next-line no-undef
                const lineBreakTransformer = new TransformStream(new LineBreakTransformer())
                const textDecoderStream = textDecoder.readable.pipeTo(lineBreakTransformer.writable)

                reader = lineBreakTransformer.readable.getReader()

                try {
                    while (true) {
                        const { value, done } = await reader.read()
                        if (done) {
                            console.log('Serial Read Done')
                            break
                        }
                        if (value) {
                            const timestamp = Date.now()
                            const [sensorId, reading] = value.split(':')
                            if (sensorId && (sensorId.startsWith('W') || sensorId.startsWith('T')) && (reading)) {
                                const data = { timestamp, sensorId, reading: parseFloat(reading) }
                                if (addDataRef.current) {
                                    await addDataRef.current(data)
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    // disconnect
                    await Promise.allSettled([
                        readableStream.catch(console.log),
                        textDecoderStream.catch(console.log)
                    ])
                    await reader.releaseLock()
                    await port.close()
                }
            }
        }

        const port = webSerialDataSource.port
        if (port) {
            if (setPauseRef.current) {
                setPauseRef.current({isPaused:false, reason: 'user'})
            }
            readFromPort(port)
        }

        return () => {
            const disconnect = async () => {
                reader.cancel()
            }
            if (port) {
                disconnect()
            }
        }
    }, [
        webSerialDataSource.baudRate,
        webSerialDataSource.dataBits,
        webSerialDataSource.flowControl,
        webSerialDataSource.parity,
        webSerialDataSource.port,
        webSerialDataSource.stopBits
    ])

    return null
}

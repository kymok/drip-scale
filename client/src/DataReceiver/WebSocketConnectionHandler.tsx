import { useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'
import { pauseState } from '../DataAcquisitionHandler/daqModeStates'
import { dataSourceState, DataSourceStateType, webSocketDataSourceState } from './dataSourceStates'
import { useAddNewData } from '../DataAcquisitionHandler/daqNewDataHandler'

export const WebSocketConnectionHandler = () => {
    const [dataSource, setDataSource] = useRecoilState(dataSourceState)
    const webSocketDataSource = useRecoilValue(webSocketDataSourceState)
    const isConnectionActive = dataSource.isActive
    const webSocketUrl = webSocketDataSource.url
    const setPause = useSetRecoilState(pauseState)
    const addNewData = useAddNewData()

    const addDataRef = useRef<Function>(() => {})
    useEffect(() => {
        console.log('renew')
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

    // WebSocket connection
    const socketRef = useRef<WebSocket | null>(null)
    useEffect(() => {
        if (setPauseRef.current) {
            setPauseRef.current({ isPaused:false, reason: 'user' })
        }
        if (dataSource.source === 'websocket' && isConnectionActive) {
            console.log(`connecting to ${webSocketUrl}...`)
            socketRef.current = new WebSocket(webSocketUrl)
            socketRef.current.addEventListener('error', async (event) => {
                console.log('WebSocket error: ', event)
                if (setDataSourceRef.current) {
                    await setDataSourceRef.current((current:DataSourceStateType) => ({ ...current, isActive: false }))
                }
            })
            socketRef.current.addEventListener('message', (event) => {
                const data = JSON.parse(event.data)
                if (addDataRef.current) {
                    addDataRef.current(data)
                }
            })
        }

        return () => {
            if (socketRef.current) {
                console.log('disconnecting...')
                socketRef.current.close()
            }
        }
    }, [
        dataSource,
        isConnectionActive,
        webSocketUrl
    ])

    return null
}

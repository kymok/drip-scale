import React, { SyntheticEvent } from 'react'
import { useRecoilState } from 'recoil'
import { dataSourceState, webSocketDataSourceState } from './dataSourceStates'
import * as Styled from '../Style/inputElements'

// WebSocket
export const WebSocketConnectionSettings = () => {
    const [dataSource, setDataSource] = useRecoilState(dataSourceState)
    const [webSocketDataSource, setWebSocketDataSource] = useRecoilState(webSocketDataSourceState)
    const isConnectionActive = dataSource.isActive
    const handleUrlChange = (e: SyntheticEvent) => {
        const url = (e.target as HTMLInputElement).value
        setWebSocketDataSource({ url })
    }
    const toggleConnectionActivity = () => {
        setDataSource({ ...dataSource, isActive: !(dataSource.isActive) })
    }
    const shouldActivateEdit = dataSource.isActive
    return (
        <>
            <Styled.LabelledInput
                label='URL'
                defaultValue={webSocketDataSource.url}
                disabled={shouldActivateEdit}
                onChange={handleUrlChange} />
            <Styled.LabelledButtonCluster>
                <Styled.Button onClick={toggleConnectionActivity}>{isConnectionActive ? 'disconnect' : 'connect'}</Styled.Button>
            </Styled.LabelledButtonCluster>
        </>
    )
}

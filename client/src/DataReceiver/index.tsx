import React, { SyntheticEvent } from 'react'
import { useRecoilState } from 'recoil'
import { dataSourceState } from './dataSourceStates'
import { WebSerialConnectionHandler } from './WebSerialConnectionHandler'
import { WebSocketConnectionHandler } from './WebSocketConnectionHandler'
import * as Styled from '../Style/inputElements'
import { WebSocketConnectionSettings } from './WebSocketConnectionSettings'
import { WebSerialConnectionSettings, WebSerialOptions } from './WebSerialConnectionSettings'
import { DemoDataGeneratorSettings } from './DemoDataGeneratorSettings'
import { DemoDataGenerator } from './DemoDataGenerator'

export const DataReceiver = () => {
    const [dataSource, setDataSource] = useRecoilState(dataSourceState)
    const handleDataSourceSelect = (e:SyntheticEvent) => {
        const selectedSource = (e.target as HTMLInputElement).value
        if (selectedSource === 'serial' || selectedSource === 'websocket' || selectedSource === 'demo') {
            setDataSource({ ...dataSource, isActive: false, source: selectedSource })
        } else {
            console.error(`Selected data source ${dataSource} does not exist`)
        }
    }
    const shouldActivateDataSourceSelector = dataSource.isActive && dataSource.source !== 'demo'
    const activeDataSource = dataSource.source
    return (
        <Styled.LabelledCard label={'Data Source'}>
            {/* Connection Handlers */}
            <WebSocketConnectionHandler />
            <WebSerialConnectionHandler />
            <DemoDataGenerator />
            {/* UI */}
            <Styled.Category>
                <Styled.LabelledSelect
                    onChange={handleDataSourceSelect}
                    disabled={shouldActivateDataSourceSelector}
                    defaultValue={activeDataSource}
                >
                    <option value="websocket">WebSocket</option>
                    <option value="serial">Serial</option>
                    <option value="demo">Demo</option>
                </Styled.LabelledSelect>
                {(() => {
                    if (activeDataSource === 'websocket') {
                        return (<WebSocketConnectionSettings />)
                    } else if (activeDataSource === 'serial') {
                        return (<WebSerialConnectionSettings />)
                    } else if (activeDataSource === 'demo') {
                        return (<DemoDataGeneratorSettings />)
                    }
                })()}
            </Styled.Category>
            {(() => {
                if (activeDataSource === 'serial') {
                    return (<WebSerialOptions />)
                }
                return null
            })()}
            {/* <DataAcquisitionController /> */}
        </Styled.LabelledCard>
    )
}



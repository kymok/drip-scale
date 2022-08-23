import React, { SyntheticEvent } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { dataSourceState, webSerialDataSourceState } from './dataSourceStates'
import * as Styled from '../Style/inputElements'

// WebSerial
export const WebSerialConnectionSettings = () => {
    const [dataSource, setDataSource] = useRecoilState(dataSourceState)
    const [webSerialDataSource, setWebSerialDataSource] = useRecoilState(webSerialDataSourceState)
    const handleSelectAndConnectToPort = async () => {
        const port = await navigator.serial.requestPort()
        setWebSerialDataSource({ ...webSerialDataSource, port })
    }
    const handleDisconnect = () => {
        setWebSerialDataSource({ ...webSerialDataSource, port: null })
        setDataSource({ ...dataSource, isActive: false })
    }
    const shouldActivateEdit = dataSource.isActive
    return (
        <div>
            <Styled.LabelledButtonCluster>
                <Styled.Button onClick={handleSelectAndConnectToPort} disabled={shouldActivateEdit}>Connect...</Styled.Button>
                <Styled.Button onClick={() => handleDisconnect()} disabled={!shouldActivateEdit}>Disconnect</Styled.Button>
            </Styled.LabelledButtonCluster>
        </div>
    )
}

// WebSerial Options
const WebSerialOptionItem = (
    { title, disabled, defaultValue, onChange, selections }: {
        title: string
        disabled: boolean
        defaultValue: unknown
        selections: any[]
        onChange?: (arg: SyntheticEvent) => void | undefined
    }
) => {
    return (
        <Styled.LabelledSelect label={title} disabled={disabled} defaultValue={defaultValue} onChange={onChange}>
            {selections.map((e) => <option key={e} value={e}>{e}</option>)}
        </Styled.LabelledSelect>
    )
}
export const WebSerialOptions = () => {
    const dataSource = useRecoilValue(dataSourceState)
    const shouldActivateEdit = dataSource.isActive
    const [webSerialDataSource, setWebSerialDataSource] = useRecoilState(webSerialDataSourceState)

    const baudRates = [300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 31250, 38400, 57600, 115200]
    const dataBits = [7, 8]
    const parities: ParityType[] = ['none', 'even', 'odd']
    const stopBits = [1, 2]
    const flowControls: FlowControlType[] = ['none', 'hardware']

    return (
        <Styled.CollapsibleCategory label='Serial Options' collapsible={true} defaultCollapsed={true}>
            <WebSerialOptionItem
                title={'Baud Rate:'}
                disabled={shouldActivateEdit}
                defaultValue={webSerialDataSource.baudRate}
                selections={baudRates}
                onChange={(e: SyntheticEvent) => setWebSerialDataSource({ ...webSerialDataSource, baudRate: parseFloat((e.target as HTMLInputElement).value) })} />
            <WebSerialOptionItem
                title={'Data Bits:'}
                disabled={shouldActivateEdit}
                defaultValue={webSerialDataSource.dataBits}
                selections={dataBits}
                onChange={(e: SyntheticEvent) => setWebSerialDataSource({ ...webSerialDataSource, dataBits: parseFloat((e.target as HTMLInputElement).value) })} />
            <WebSerialOptionItem
                title={'Parity:'}
                disabled={shouldActivateEdit}
                defaultValue={webSerialDataSource.parity}
                selections={parities}
                onChange={(e: SyntheticEvent) => setWebSerialDataSource({ ...webSerialDataSource, parity: ((e.target as HTMLInputElement).value as ParityType) })} />
            <WebSerialOptionItem
                title={'Stop Bits:'}
                disabled={shouldActivateEdit}
                defaultValue={webSerialDataSource.stopBits}
                selections={stopBits}
                onChange={(e: SyntheticEvent) => setWebSerialDataSource({ ...webSerialDataSource, stopBits: parseFloat((e.target as HTMLInputElement).value) })} />
            <WebSerialOptionItem
                title={'Hardware Flow Control:'}
                disabled={shouldActivateEdit}
                defaultValue={webSerialDataSource.flowControl}
                selections={flowControls}
                onChange={(e: SyntheticEvent) => setWebSerialDataSource({ ...webSerialDataSource, flowControl: ((e.target as HTMLInputElement).value as FlowControlType) })} />
        </Styled.CollapsibleCategory>
    )
}

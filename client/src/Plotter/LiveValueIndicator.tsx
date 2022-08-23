import React from 'react'
import { useRecoilValue } from 'recoil'
import { calibratedLatestFastAverageDataSelector } from "../DataAcquisitionHandler/plottableHistory"
import { dataSourceState } from '../DataReceiver/dataSourceStates'
import * as Styled from '../Style/contentArea'
import { daqModeStateStringSelector } from '../DataAcquisitionHandler/daqModeStates'

export const LiveValueIndicator = () => {
    const readingW1 = useRecoilValue(calibratedLatestFastAverageDataSelector('W1'))?.reading || 0
    const readingW2 = useRecoilValue(calibratedLatestFastAverageDataSelector('W2'))?.reading || 0
    const readingT1 = useRecoilValue(calibratedLatestFastAverageDataSelector('T1'))?.reading || 0
    const isActive = useRecoilValue(dataSourceState).isActive

    const triggerState = useRecoilValue(daqModeStateStringSelector)
    const statusString = {
        disconnected: '----',
        tare: 'TARE...',
        standby: 'STBY',
        triggered: 'TRIG\'D',
        freerun: 'FREERUN',
        stop: 'STOP',
        autostop: 'AUTOSTOP'
    }[triggerState]

    return (
        <Styled.Category label={'Scale Status'}>
            <Styled.LiveValuesContainer>
                <Styled.LabelledStatusString label={'Status'} status={triggerState} isActive={isActive}>{statusString}</Styled.LabelledStatusString>
                <Styled.LabelledLiveValue label={'Pour'} unit={'g'} isActive={isActive}>{readingW1.toFixed(1)}</Styled.LabelledLiveValue>
                <Styled.LabelledLiveValue label={'Extract'} unit={'g'} isActive={isActive}>{readingW2.toFixed(1)}</Styled.LabelledLiveValue>
                <Styled.LabelledLiveValue label={'Temp. 1'} unit={'°C'} isActive={isActive}>{readingT1.toFixed(1)}</Styled.LabelledLiveValue>
            </Styled.LiveValuesContainer>
        </Styled.Category>
    )
}

import React from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { PauseState, pauseState, tareState, triggerState } from '../DataAcquisitionHandler/daqModeStates'
import { clearHistory } from '../DataAcquisitionHandler/history'
import * as Styled from '../Style/inputElements'

export const DataAcquisitionController = () => {
    const [trigger, setTrigger] = useRecoilState(triggerState)
    const setTare = useSetRecoilState(tareState)
    const setPause = useSetRecoilState(pauseState)
    const reset = useSetRecoilState(clearHistory)

    const handleTriggerStandby = () => {
        setPause({isPaused:false, reason:'user'})
        setTrigger((current) => ({ ...current, standby: true, timestamp: null }))
    }
    const handleFreerun = () => {
        setPause({isPaused:false, reason:'user'})
        setTrigger((current) => ({ ...current, standby: false, timestamp: null }))
    }
    const handleTare = () => {
        setTare((current) => ({
            ...current,
            W1: { ...current.W1, shouldTare: true },
            W2: { ...current.W2, shouldTare: true }
        }))
    }
    const handlePause = (newPause: PauseState) => {
        setPause(newPause)
    }
    const handleClear = () => {
        if (trigger.timestamp) {
            handleTriggerStandby()
        }
        reset(null)
    }

    return (
        <Styled.CollapsibleCategory collapsible={true} defaultCollapsed={true} label={'Acquisition Control'}>
            <Styled.LabelledButtonCluster label='Tare'>
                <Styled.Button onClick={handleTare}>Tare</Styled.Button>
            </Styled.LabelledButtonCluster>
            <Styled.LabelledButtonCluster label='Trigger'>
                <Styled.Button onClick={handleTriggerStandby}>Trigger STBY</Styled.Button>
                <Styled.Button onClick={handleFreerun}>Free Run</Styled.Button>
            </Styled.LabelledButtonCluster>
            <Styled.LabelledButtonCluster label='Acquisition'>
                <Styled.Button onClick={() => handlePause({isPaused:true, reason: 'user'})}>Stop</Styled.Button>
                <Styled.Button onClick={() => handlePause({isPaused:false, reason: 'user'})}>Resume</Styled.Button>
                <Styled.Button onClick={handleClear}>Clear</Styled.Button>
            </Styled.LabelledButtonCluster>
        </Styled.CollapsibleCategory>
    )
}

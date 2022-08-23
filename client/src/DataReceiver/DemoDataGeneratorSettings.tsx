import { useResetRecoilState, useSetRecoilState } from "recoil"
import { dataSourceState, demoDataGeneratorPropertiesState } from "./dataSourceStates"
import * as Styled from '../Style/inputElements'

// For Demo
import { clearHistory } from '../DataAcquisitionHandler/history'
import { pauseState, tareState, triggerState } from '../DataAcquisitionHandler/daqModeStates'

export const DemoDataGeneratorSettings = () => {
    const setDataSource = useSetRecoilState(dataSourceState)
    const setDemoState = useSetRecoilState(demoDataGeneratorPropertiesState)
    const resetDemoState = useResetRecoilState(demoDataGeneratorPropertiesState)
    const setTrigger = useSetRecoilState(triggerState)
    const setTare = useSetRecoilState(tareState)
    const setPause = useSetRecoilState(pauseState)
    const reset = useSetRecoilState(clearHistory)

    const handleTare = () => {
        setTare((current) => ({
            ...current,
            W1: { ...current.W1, shouldTare: true },
            W2: { ...current.W2, shouldTare: true }
        }))
    }
    const handleStart = () => {
        console.log('Demo start')
        // standby
        reset(null)
        handleTare()
        setTrigger((current) => ({ ...current, standby: true, timestamp: null }))
        setPause({isPaused: false, reason:'user'})
        // connect
        resetDemoState()
        setDemoState((current) => ({ ...current, mode:'curveTracing', pourStartTimestamp: Date.now() + 3_000}))
        setDataSource((current) => ({ ...current, isActive: true }))
    }
    const handleClear = () => {
        console.log('Demo clear')
        reset(null)
        resetDemoState()
        setDataSource((current) => ({ ...current, isActive: false }))
    }

    return (
        <div>
            <Styled.LabelledButtonCluster>
                <Styled.Button onClick={handleStart}>Start Demo</Styled.Button>
                <Styled.Button onClick={handleClear}>Clear</Styled.Button>
            </Styled.LabelledButtonCluster>
        </div>
    )
}
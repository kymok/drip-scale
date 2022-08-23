import { useRecoilValue, useSetRecoilState } from 'recoil'
import { PauseState, pauseState, tareState, triggerState } from '../DataAcquisitionHandler/daqModeStates'
import { clearHistory } from '../DataAcquisitionHandler/history'
import { dataSourceState } from '../DataReceiver/dataSourceStates'
import { LiveValueIndicator } from '../Plotter/LiveValueIndicator'
import * as Styled from '../Style/inputElements'

export const DataAcquisitionController = () => {
    const setTrigger = useSetRecoilState(triggerState)
    const setTare = useSetRecoilState(tareState)
    const setPause = useSetRecoilState(pauseState)
    const reset = useSetRecoilState(clearHistory)
    const dataSource = useRecoilValue(dataSourceState)

    const handleTare = () => {
        setTare((current) => ({
            ...current,
            W1: { ...current.W1, shouldTare: true },
            W2: { ...current.W2, shouldTare: true }
        }))
    }
    const handleTriggerStandby = () => {
        reset(null)
        handleTare()
        setTrigger((current) => ({ ...current, standby: true, timestamp: null }))
        setPause({ isPaused: false, reason:'user' })
    }

    const handlePause = (newPause:PauseState) => {
        setPause(newPause)
    }

    const shouldDisableStandby = dataSource.source === 'demo'

    return (
        <div>
            <Styled.Category label={'Control'}>
                <Styled.InputRowFlexContainer>
                    <Styled.LabelledButtonCluster>
                        <Styled.Button onClick={handleTriggerStandby} disabled={shouldDisableStandby}>Standby</Styled.Button>
                    </Styled.LabelledButtonCluster>
                    <Styled.LabelledButtonCluster>
                        <Styled.Button onClick={() => handlePause({ isPaused:true, reason:'user' })}>Stop</Styled.Button>
                        <Styled.Button onClick={() => handlePause({ isPaused:false, reason:'user' })}>Resume</Styled.Button>
                    </Styled.LabelledButtonCluster>
                </Styled.InputRowFlexContainer>
            </Styled.Category>
            <LiveValueIndicator />
        </div>
    )
}

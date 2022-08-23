import { useEffect, useRef } from "react"
import { useRecoilValue, useRecoilState } from "recoil"
import { useAddNewData } from "../DataAcquisitionHandler/daqNewDataHandler"
import { currentReferenceCurveSelector, globalOptionValuesSelector, sampleReferenceCurve } from "../ReferenceCurveEditor/referenceCurveOptionSelectors"
import { dataSourceState, demoDataGeneratorPropertiesState } from "./dataSourceStates"

const useInterval = ( callback: Function, delay: number | null ) => {
    const callbackRef = useRef<Function>(()=>{})
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        if (callbackRef.current && delay) {
            const tick = () => {
                callbackRef.current()
            }
            const id = setInterval(tick, delay)
            return (() => clearInterval(id))
        }
    }, [delay])
}

export const DemoDataGenerator = () => {
    const dataSource = useRecoilValue(dataSourceState)
    const [demoData, setDemoData] = useRecoilState(demoDataGeneratorPropertiesState)
    const shouldActivateDemoDataGenerator = dataSource.source === 'demo' && dataSource.isActive
    const delay = shouldActivateDemoDataGenerator ? demoData.samplingInterval : null
    const addNewData = useAddNewData()
    const curve = useRecoilValue(currentReferenceCurveSelector)?.pourCurve || []
    const coffeeWeight = Number(useRecoilValue(globalOptionValuesSelector).coffeeWeight)
    
    const callback = () => {
        const pourStartTimestamp = demoData.pourStartTimestamp
        if (pourStartTimestamp) {
            const now = Date.now()
            const elapsedTimeMs = now - pourStartTimestamp
            const dt = now - demoData.elapsedTimeMs - pourStartTimestamp

            // weight
            const weight = demoData.pourWeight
            const newWeight = weight + dt * demoData.pourRate / 1000
            const newAbsorption = Math.min(newWeight/3, coffeeWeight * 2)
            const newFlowableWeight = newWeight - newAbsorption - demoData.extractWeight
            const flowSpeed = newFlowableWeight * (1/5)
            const newExtractWeight = demoData.extractWeight + flowSpeed * dt / 1000
            
            // target value
            const targetWeight = sampleReferenceCurve({ curve, elapsedTime: elapsedTimeMs / 1000 + demoData.lookAheadMs / 1000 }) || 0
            const targetPourRate = demoData.pourRate

            // Add imprecision
            let actualTargetPourRate = targetPourRate
            const weightThreshold = 2.0
            if (Math.abs(targetWeight - newWeight) > weightThreshold) {
                actualTargetPourRate = (targetWeight - newWeight) / (demoData.lookAheadMs / 1_000)
            }
            let actualPourRate = actualTargetPourRate * (1 + (Math.random() * 2 - 1) * demoData.pourRatePrecisionPercent / 100)
            actualPourRate = Math.max(actualPourRate, 0)
            actualPourRate = actualPourRate * 0.05 + demoData.pourRate * 0.95
            
            // Write data
            const timestamp = now
            const addAllData = async () => {
                await addNewData({ sensorId: 'W1', reading: newWeight + Math.random() * 0.4, timestamp })
                await addNewData({ sensorId: 'W2', reading: newExtractWeight + Math.random() * 0.4, timestamp })
                await addNewData({ sensorId: 'T1', reading: 90 + Math.random() * 1, timestamp })
            }
            addAllData()
            setDemoData({
                ...demoData, 
                pourRate: actualPourRate,
                pourWeight: newWeight,
                elapsedTimeMs,
                extractWeight: newExtractWeight,
            })
        }
        else {
            const now = Date.now()
            const timestamp = now
            const addAllData = async () => {
                await addNewData({ sensorId: 'W2', reading: Math.random() * 0.2, timestamp })
                await addNewData({ sensorId: 'T1', reading: 90 + Math.random() * 1, timestamp })
                await addNewData({ sensorId: 'W1', reading: Math.random() * 0.2, timestamp })
            }
            addAllData()
        }
    }
    useInterval(callback, delay)
    return null
}
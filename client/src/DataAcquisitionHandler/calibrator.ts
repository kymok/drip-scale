import { selectorFamily } from 'recoil'
import { isRecoilDefaultValue } from '../utils'
import { sensorPropertiesState } from './sensorProperties'

export const calibratorSelector = selectorFamily({
    key: 'calibratorSelector',
    get: (sensorId: string) => ({ get }) => {
        const sensorProperty = get(sensorPropertiesState)[sensorId]
        const calibrationOptions = sensorProperty.calibrationOptions
        const calibrationFunction = (value:number) => (value - calibrationOptions.offset) * calibrationOptions.scale
        return calibrationFunction
    }
})

export const derivativeCalibratorSelector = selectorFamily({
    key: 'derivativeCalibratorSelector',
    get: (sensorId: string) => ({ get }) => {
        const sensorProperty = get(sensorPropertiesState)[sensorId]
        const calibrationOptions = sensorProperty.calibrationOptions
        const calibrationFunction = (value:number) => value * calibrationOptions.scale
        return calibrationFunction
    }
})

export const sensorOffsetSelector = selectorFamily({
    key: 'sensorOffsetSelector',
    get: (sensorId: string) => ({ get }) => {
        const sensorProperties = get(sensorPropertiesState)
        return sensorProperties[sensorId].calibrationOptions.offset
    },
    set: (sensorId: string) => ({ get, set }, newValue) => {
        const sensorProperties = get(sensorPropertiesState)
        const newSensorProperty = { ...sensorProperties[sensorId] }
        if (isRecoilDefaultValue(newValue) || newValue === undefined) {
            return
        }
        newSensorProperty.calibrationOptions = { ...newSensorProperty.calibrationOptions, offset: newValue }
        const newSensorProperties = { ...sensorProperties, [sensorId]: newSensorProperty }
        set(sensorPropertiesState, newSensorProperties)
    }
})

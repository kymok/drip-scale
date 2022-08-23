import { bisectLeft } from 'd3'
import { selector, selectorFamily } from 'recoil'
import { isRecoilDefaultValue, lerp } from '../utils'
import { curveState, referenceCurvePropertiesState, referenceCurveGlobalOptionsState, ReferenceCurveDataPoint } from './referenceCurveStates'

// Curve options
const curveAllOptionValuesSelector = selectorFamily({
    key: 'referenceCurveOptionValuesSelector',
    get: (curveId: string) => ({ get }) => {
        const curveOptionValues = get(curveSpecificOptionValuesSelector(curveId))
        const globalOptionValues = get(globalOptionValuesSelector)
        return { ...globalOptionValues, ...curveOptionValues }
    }
})
export const curveSpecificOptionValuesSelector = selectorFamily({
    key: 'referenceCurveSpecificOptionValuesSelector',
    get: (curveId: string) => ({ get }) => {
        const curveProperty = get(referenceCurvePropertiesState)[curveId]
        const options = { ...curveProperty.options }
        return Object.fromEntries(Object.keys(options).map(
            (e) => [e, options[e].value ?? options[e].defaultValue])
        )
    },
    set: (curveId: string) => ({ get, set }, newValue) => {
        const curveProperties = get(referenceCurvePropertiesState)
        const curveProperty = curveProperties[curveId]
        const newOptions = { ...curveProperty.options }
        if (isRecoilDefaultValue(newValue)) {
            // reset
            const keys = Object.keys(newOptions)
            keys.forEach((key) => delete newOptions[key].value)
        } else {
            // set new values
            const keys = Object.keys(newValue)
            keys.forEach((key) => {
                if (!!newOptions[key]) {
                    const newOptionItem = { ...newOptions[key] }
                    newOptionItem.value = newValue[key]
                    newOptions[key] = newOptionItem
                } else {
                    console.warn(`No curve option ${key} found`)
                }
            })
        }
        const newCurveProperty = { ...curveProperty, options: newOptions }
        const newCurveProperties = { ...curveProperties, [curveId]: newCurveProperty }
        set(referenceCurvePropertiesState, newCurveProperties)
    }
})

export const globalOptionValuesSelector = selector({
    key: 'globalOptionValuesSelector',
    get: ({ get }) => {
        const globalOptions = get(referenceCurveGlobalOptionsState)
        const options = { ...globalOptions }
        return Object.fromEntries(Object.keys(options).map(
            (e) => [e, options[e].value ?? options[e].defaultValue])
        )
    },
    set: ({ get, set, reset }, newValue) => {
        const globalOptions = get(referenceCurveGlobalOptionsState)
        const newOptions = { ...globalOptions }

        if (isRecoilDefaultValue(newValue)) {
            reset(referenceCurveGlobalOptionsState)
            return
        }
        const keys = Object.keys(newValue)
        keys.forEach((key) => {
            if (!!newOptions[key]) {
                const newOptionItem = { ...newOptions[key] }
                newOptionItem.value = newValue[key]
                newOptions[key] = newOptionItem
            }
            else {
                console.warn(`No curve option ${key} found`)
            }
        })
        set(referenceCurveGlobalOptionsState, newOptions)
    }
})

const referenceCurveSelector = selectorFamily({
    key: 'referenceCurveSelector',
    get: (curveId: string) => ({ get }) => {
        const curveProperty = get(referenceCurvePropertiesState)[curveId]
        const params = get(curveAllOptionValuesSelector(curveId))
        const generator = curveProperty.generator
        if (params) {
            return generator(params)
        }
    }
})

export const currentReferenceCurveSelector = selector({
    key: 'currentReferenceCurveSelector',
    get: ({ get }) => {
        const curveId = get(curveState).id
        return get(referenceCurveSelector(curveId))
    }
})

export const sampleReferenceCurve = ({ curve, elapsedTime }: { curve:ReferenceCurveDataPoint[], elapsedTime: number }) => {
    if (curve.length === 0) {
        return undefined
    }
    const dts = curve.map((e) => e.dt)
    const insertIndex = bisectLeft(dts, elapsedTime)
    if (insertIndex === 0) {
        return curve[0].value
    }
    else if (insertIndex >= curve.length) {
        return curve[curve.length - 1].value
    }
    const left = curve[insertIndex-1]
    const right = curve[insertIndex]
    return lerp(left.dt, right.dt, left.value, right.value, elapsedTime)
}

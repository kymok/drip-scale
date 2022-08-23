import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { curveState, referenceCurvePropertiesState, referenceCurveGlobalOptionsState, ReferenceCurveNumberOption, ReferenceCurveSelectOption, ReferenceCurveOption } from './referenceCurveStates'
import * as Styled from '../Style/inputElements'
import { useState, SyntheticEvent } from 'react'
import { globalOptionValuesSelector, curveSpecificOptionValuesSelector } from './referenceCurveOptionSelectors'


const NumberInput = ({ setter, option }: { setter: Function, option: ReferenceCurveNumberOption & { key: string }}) => {
    const key = option.key
    const value = option.value ?? option.defaultValue
    const displayName = option.displayName
    const unit = option.unit
    const isResetEnabled = (option.value || option.value === 0) && option.value !== option.defaultValue
    const incrementStep = option.incrementStep || 5
    const clampValue = (val: number) => Math.min(Math.max(val, option.minValue), option.maxValue)
    const roundToIncrementStep = (val: number) => Math.round(val / incrementStep) * incrementStep

    const [isEditing, setIsEditing] = useState(false)
    const [valueBeingEdited, setValueBeingEdited] = useState(value.toString())
    const handleFocus = () => {
        setValueBeingEdited(value.toString())
        setIsEditing(true)
    }
    const handleBlur = () => {
        setValueBeingEdited(value.toString())
        setIsEditing(false)
    }
    const handleChange = (event: SyntheticEvent) => {
        setValueBeingEdited((event.target as HTMLInputElement).value)
        const parsedValue = parseFloat((event.target as HTMLInputElement).value)
        const newValue = clampValue(parsedValue)
        if (newValue || newValue === 0) {
            setter({ [key]: newValue })
        }
    }
    const handleIncrement = () => setter({ [key]: clampValue(roundToIncrementStep(value + incrementStep)) })
    const handleDecrement = () => setter({ [key]: clampValue(roundToIncrementStep(value - incrementStep)) })
    const handleReset = () => setter({ [key]: undefined })
    return (
        <Styled.LabelledNumberInput
            label={displayName}
            value={isEditing ? valueBeingEdited : value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            handleReset={handleReset}
            unit={unit}
            isResetEnabled={isResetEnabled}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
        />
    )
}

const SelectInput = ({ setter, option }: {
    setter: Function,
    option: (ReferenceCurveSelectOption<number> | ReferenceCurveSelectOption<string>) & { key: string }
}) => {
    const key = option.key
    const value = option.value || option.defaultValue
    const selections = option.selections
    const displayName = option.displayName
    const isResetEnabled = (option.value || option.value === 0) && option.value !== option.defaultValue
    const handleChange = (event: SyntheticEvent) => {
        setter({ [key]: parseFloat((event.target as HTMLInputElement).value) })
    }
    const handleReset = () => setter({ [key]: undefined })
    return (
        <Styled.LabelledSelect
            label={displayName}
            onChange={handleChange}
            value={value}
            handleReset={handleReset}
            isResetEnabled={isResetEnabled}
            isResettable={true}
        >
            {selections.map((e) => (<option key={e.value} value={e.value}>{e.displayName}</option>))}
        </Styled.LabelledSelect>
    )
}

const sortKey = (options: Record<string, ReferenceCurveOption>) => {
    const unsorted = Object.entries(options)
    const sortedKeys = unsorted.sort((a, b) => a[1].viewOrder - b[1].viewOrder).map((e) => e[0])
    return sortedKeys
}

export const ReferenceCurveEditor = () => {
    // Reference Curve
    const [curve, setCurve] = useRecoilState(curveState)
    const curveId = curve.id
    const handleCurveChange = (curveId: string) => {
        setCurve({...curve, id:curveId})
    }

    // Curve list
    const curves = useRecoilValue(referenceCurvePropertiesState)
    const curveList = Object.keys(curves).sort()

    // Global Options
    const referenceCurveGlobalOptions = useRecoilValue(referenceCurveGlobalOptionsState)
    const setGlobalOptionValue = useSetRecoilState(globalOptionValuesSelector)
    const globalOptionKeys = sortKey(referenceCurveGlobalOptions)

    // Curve Specific Options
    const referenceCurveOptions = useRecoilValue(referenceCurvePropertiesState)[curveId].options
    const setCurveSpecificOptionValue = useSetRecoilState(curveSpecificOptionValuesSelector(curveId))
    const curveSpecificOptionKeys = sortKey(referenceCurveOptions)

    return (
        <Styled.LabelledCard label={'Reference Curve'}>
            <div>
                <Styled.Category>

                    {/* Global Options */}
                    {globalOptionKeys.map((key) => {
                        const option = { ...referenceCurveGlobalOptions[key], key }
                        if (option.valueType === 'number') {
                            return (<NumberInput key={key} setter={setGlobalOptionValue} option={option} />)
                        } else if (option.valueType === 'select') {
                            return (<SelectInput key={key} setter={setGlobalOptionValue} option={option} />)
                        } else {
                            return null;
                        }
                    })}

                    {/* Curve Select */}
                    <Styled.LabelledSelect
                        label='Base Curve'
                        value={curveId}
                        onChange={(e:SyntheticEvent) => handleCurveChange((e.target as HTMLInputElement).value)}
                    >
                        {curveList.map((key) => (
                            <option key={key} value={key}>
                                {curves[key].name}
                            </option>
                        ))}
                    </Styled.LabelledSelect>
                </Styled.Category>

                {/* Curve Specific Options */}
                <Styled.CollapsibleCategory label='Curve Options' collapsible={true} defaultCollapsed={true}>
                    {curveSpecificOptionKeys.map((key) => {
                        const option = { ...referenceCurveOptions[key], key }
                        if (option.valueType === 'number') {
                            return (<NumberInput key={key} setter={setCurveSpecificOptionValue} option={option} />)
                        } else if (option.valueType === 'select') {
                            return (<SelectInput key={key} setter={setCurveSpecificOptionValue} option={option} />)
                        } else {
                            return null;
                        }
                    })}
                </Styled.CollapsibleCategory>
            </div>
        </Styled.LabelledCard>
    )
}

import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import resetIcon from './buttonImage/reset.svg'
import decrementIcon from './buttonImage/decrement.svg'
import incrementIcon from './buttonImage/increment.svg'

const inputElementRadius = '.5rem'

// Card
const Card = styled.div`
    border-radius: 1rem;
    background: #fff;
    padding: 1rem;
`
const CardLabel = styled.div`
    font-weight: 700;
    font-size: 1.5rem;
`
const CardContentContainer = styled.div`
`
export const LabelledCard = (props: any & {label?: string}) => {
    return (
        <Card>
            <CardLabel>{props.label}</CardLabel>
            <CardContentContainer>
                {props.children}
            </CardContentContainer>
        </Card>
    )
}

// Category
const CategoryContainer = styled.div`
    margin-top: 1rem;
`
const CategoryLabel = styled.div`
    font-weight: bold;
    color: #999;
    font-size: 0.8rem;
`
type CategoryContentContainerProps = {
    collapsible?: boolean,
    collapsed?: boolean,
    contentHeight?: number,
    label?: string | undefined,
}
const CategoryContentContainer = styled.div<CategoryContentContainerProps>`
    height: ${(props) => props.collapsible ? '9999px' : 'auto'};
    max-height: ${(props) => props.collapsed ? '0' : (props.contentHeight) + 'px'};
    overflow: hidden;
    transition: ${(props) => props.collapsible ? 'max-height 0.1s ease' : 'none'};
    margin-top: ${(props) => props.label ? '0' : '-0.75rem'};
`
export const Category = (props: any & CategoryContentContainerProps) => {
    return (
        <CategoryContainer>
            <CategoryLabel>{props.label}</CategoryLabel>
            <CategoryContentContainer label={props.label}>
                <div>
                    {props.children}
                </div>
            </CategoryContentContainer>
        </CategoryContainer>
    )
}
export const CollapsibleCategory = (props: any & CategoryContentContainerProps) => {
    const [collapsed, setCollapsed] = useState(props.collapsible && props.defaultCollapsed)
    const [contentHeight, setContentHeight] = useState(500)
    const handleCollapse = () => {
        if (props.collapsible) {
            setCollapsed(!collapsed)
        }
    }
    const ref = useRef(null)
    useEffect(() => {
        if (!ref.current) {
            return
        }
        let resizeObserver: (ResizeObserver | null) = new ResizeObserver((entries) => {
            entries.forEach((e) => {
                setContentHeight(e.contentRect.height)
            })
        })
        resizeObserver.observe(ref.current)
        return () => {
            resizeObserver?.disconnect()
            resizeObserver = null
        }
    }, [])

    return (
        <CategoryContainer>
            <CategoryLabel onClick={handleCollapse}>{props.collapsible ? (collapsed ? '▶\xa0' : '▼\xa0') : ''}{props.label}</CategoryLabel>
            <CategoryContentContainer contentHeight={contentHeight} collapsed={collapsed} collapsible={props.collapsible} label={props.label}>
                <div ref={ref}>
                    {props.children}
                </div>
            </CategoryContentContainer>
        </CategoryContainer>
    )
}

// Option

// container
const InputContainer = styled.div`
    /* using padding to accurately observe size of the element */
    padding-top: 0.75rem;
`
export const InputRowFlexContainer = styled.div`
    display: flex;
    gap: 0.25rem;
`
const ButtonClusterContainer = styled.div`
    display: flex;
    gap: 1px;
`
// label
const InputLabel = styled.div`
    font-size: .9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
`
// reset button
const ResetButton = styled.button`
    border-radius: 0.6rem;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    background: #eee;
    transition: background 0.5s, transform 0.5s;
    &:hover {
        background: #f91;
        transition: background 0.5s, transform 0.1s;
        transform: rotate(-15deg);
    }
    &:disabled {
        background: #f8f8f8;
        transform: none;
    }
`
type ResetButtonProps = {
    isResetEnabled: boolean
}
const ResetButtonImage = styled.img<ResetButtonProps>`
    opacity: ${(props) => props.isResetEnabled ? '1.0' : '0.2'};
`
// input
export const Button = styled.button`
    height: 2rem;
    background: #ddd8;
    padding: 0 0.75rem;
    backdrop-filter: blur(2px);
    
    &:first-child {
        border-top-left-radius: ${inputElementRadius};
        border-bottom-left-radius: ${inputElementRadius};
    }
    &:last-child {
        border-top-right-radius: ${inputElementRadius};
        border-bottom-right-radius: ${inputElementRadius};
    }

    transition: background 0.3s;
    &:hover {
        background: #ccc8;
        transition: background 0.1s;
    }
    &:disabled {
        background: #eee8;
        color: #999;
    }
`
export const SmallButton = styled(Button)`
    height: 1.5rem;
    line-height: 1.5rem;
    padding: 0 0.5rem;
    font-size: 0.9rem;
`
const Input = styled.input`
    box-sizing: border-box;
    border-bottom: 1px solid #ccc;
    width: 12rem;
    height: 2rem;
    overflow: hidden;
    background: white;
    padding: 0 0.5em;
`
const NumberInput = styled(Input)`
    width: 6rem;
`
const OverlaidInputWrapper = styled.div`
    position: relative;
`
const InputOverlayContainer = styled.div`
    position: absolute;
    display: flex;
    height: 1.2rem;
    right: 0;
    top: .4rem;
`
const InputUnit = styled.div`
    height: 1.2rem;
    line-height: 1.2rem;
    margin-right: .25rem;
    color: #999;
`
export const InputLabeller = (props: any & {label?: string}) => {
    return (
        <InputContainer>
            {props.label ? <InputLabel>{props.label}</InputLabel> : null}
            <InputRowFlexContainer>
                {props.children}
            </InputRowFlexContainer>
        </InputContainer>
    )
}
export const LabelledButtonCluster = (props: any & {label?: string}) => {
    return (
        <InputLabeller label={props.label}>
            <ButtonClusterContainer>
                {props.children}
            </ButtonClusterContainer>
        </InputLabeller>
    )
}
export const LabelledNumberInput = (props: any & {label?: string, isResetEnabled?: boolean, handleReset?: Function, unit?: string, handleDecrement?: Function, handleIncrement?: Function}) => {
    return (
        <InputLabeller label={props.label}>
            <OverlaidInputWrapper>
                <NumberInput {...props} handleReset={undefined} type={'number'}/>
                <InputOverlayContainer>
                    <InputUnit>{props.unit || ''}</InputUnit>
                    <ResetButton onClick={props.handleReset} title='Reset to default' disabled={!props.isResetEnabled}>
                        <ResetButtonImage src={resetIcon} isResetEnabled={props.isResetEnabled} />
                    </ResetButton>
                </InputOverlayContainer>
            </OverlaidInputWrapper>
            <ButtonClusterContainer>
                <DecrementButton onClick={props.handleDecrement} />
                <IncrementButton onClick={props.handleIncrement} />
            </ButtonClusterContainer>
        </InputLabeller>
    )
}
export const LabelledInput = (props:any & {label?: string}) => {
    return (
        <InputLabeller label={props.label}>
            <OverlaidInputWrapper>
                <Input {...props} />
            </OverlaidInputWrapper>
        </InputLabeller>
    )
}
const IconButton = styled(Button)`
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    margin-top: .25rem;
`
export const DecrementButton = (props:any) => {
    return (
        <IconButton {...props}><img src={decrementIcon} alt={'Decrement icon'}/></IconButton>
    )
}
export const IncrementButton = (props:any) => {
    return (
        <IconButton {...props}><img src={incrementIcon} alt={'Increment icon'}/></IconButton>
    )
}
// Select
const SelectBase = styled.select`
    box-sizing: border-box;
    border-radius: ${inputElementRadius};
    border: 1px solid #ccc;
    min-width: 4.5rem;
    height: 2rem;
    line-height: calc(2rem - 2px);
    padding-left: 0.5rem;
    padding-right: 2rem;
    transition: border-color 0.3s;
    :hover {
        border-color: #999;
        transition: border-color 0.1s;
    }
    :disabled {
        border-color: #eee;
        color: #999;
    }
`
const SelectArrowAdder = styled.div`
    position: relative;
    display: inline-block;
    &:after {
        /* custom arrow */
        position: absolute;
        right: 0.75rem;
        top: calc(0.75rem - 0.1rem);
        content: '.';
        color: rgba(0,0,0,0);
        display: inline-block;
        width: .5rem;
        height: .5rem;
        border: solid 2px #999;
        border-right: none;
        border-top: none;
        transform: rotate(-45deg);
        pointer-events: none;
    }
`

const Select = (props:any) => {
    return (
        <SelectArrowAdder>
            <SelectBase {...props}>
                {props.children}
            </SelectBase>
        </SelectArrowAdder>
    )
}
const SelectResetButton = styled(ResetButton)`
    margin-top: .4rem;
`
export const LabelledSelect = (props:any & {label?: string, isResetEnabled?: boolean, handleReset?: Function, disabled?: boolean}) => {
    if (props.isResettable) {
        return (
            <InputLabeller label={props.label}>
                <Select {...props} />
                <SelectResetButton onClick={props.handleReset} title='Reset to default' disabled={!props.isResetEnabled || props.disabled}>
                    <ResetButtonImage src={resetIcon} isResetEnabled={props.isResetEnabled && !props.disabled} />
                </SelectResetButton>
            </InputLabeller>
        )
    }
    return (
        <InputLabeller label={props.label}>
            <Select {...props} />
        </InputLabeller>
    )
}

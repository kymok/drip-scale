import React from 'react'
import styled from 'styled-components'
import { AcquisitionStatus } from '../DataAcquisitionHandler/daqModeStates'
import * as InputElements from './inputElements'

const PlotLabel = styled.div`
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
`
const PlotWrapper = styled.div`
    margin-top: 0.5rem;
`
const PlotContainer = styled.div`
    position: relative;
`
export const PlotControls = styled.div`
    position: absolute;
    right: 0.25rem;
    bottom: 0.25rem;
`
export const LabelledPlotArea = (props: any & {label?: string}) => {
    return (
        <PlotWrapper>
            <PlotLabel>{props.label}</PlotLabel>
            <PlotContainer>
                {props.children}
            </PlotContainer>
        </PlotWrapper>
    )
}

export const Category = InputElements.Category

type LiveValuePropsType = {
    isActive?: boolean,
    status?: AcquisitionStatus
}
const LiveValueBase = styled.div<LiveValuePropsType>`
    height: 2rem;
    font-size: 1.25rem;
    line-height: 2rem;
    background: #f8f8f8;
    overflow: hidden;
    color: ${(props) => props.isActive ? 'black' : '#aaa'};
`
const LiveValue = styled(LiveValueBase)`
    width: 5rem;
    padding-left: 0.5rem;
    text-align: right;
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
`
const LiveValueUnit = styled(LiveValueBase)`
    padding: 0 0.5rem 0 0.25rem;
    text-align: left;
    color: ${(props) => props.isActive ? '#aaa' : '#aaa'};
`
const LiveValueWrapper = styled.div`
    display: flex;
`
const LiveStatusString = styled(LiveValueBase)`
    width: 8rem;
    padding: 0 0.5rem;
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    background: ${(props) => {
        switch (props.status) {
        case 'standby':
            return '#fff824'
        case 'triggered':
            return '#2fed6f'
        case 'tare':
            return '#13cfcb'
        case 'stop':
            return '#f55658'
        case 'autostop':
            return '#f55658'
        default:
            return '#f8f8f8'
        }
    }};
`
export const LabelledLiveValue = (props: any & {label?: string, unit?: string}) => {
    return (
        <InputElements.InputLabeller label={props.label}>
            <LiveValueWrapper>
                <LiveValue {...props}>{props.children}</LiveValue>
                <LiveValueUnit>{props.unit}</LiveValueUnit>
            </LiveValueWrapper>
        </InputElements.InputLabeller>
    )
}
export const LabelledStatusString = (props: any & {label?: string}) => {
    return (
        <InputElements.InputLabeller label={props.label}>
            <LiveValueWrapper>
                <LiveStatusString {...props}>{props.children}</LiveStatusString>
            </LiveValueWrapper>
        </InputElements.InputLabeller>
    )
}
export const LiveValuesContainer = InputElements.InputRowFlexContainer

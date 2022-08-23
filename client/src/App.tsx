import React from 'react'
import { RecoilRoot } from 'recoil'
import { DataReceiver } from './DataReceiver'
import { DataAcquisitionController } from './DataAcquisitionController/PlotAreaController'
import { Plotter } from './Plotter'
import { ReferenceCurveEditor } from './ReferenceCurveEditor'
import * as S from './Style'

function App () {
    return (
        <RecoilRoot>
            <S.AppWrapper>
                <S.Sidebar>
                    <DataReceiver />
                    <ReferenceCurveEditor />
                </S.Sidebar>
                <S.ContentArea>
                    <DataAcquisitionController />
                    <Plotter />
                </S.ContentArea>
            </S.AppWrapper>
        </RecoilRoot>
    )
}

export default App

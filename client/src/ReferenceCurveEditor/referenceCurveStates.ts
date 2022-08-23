import { atom } from 'recoil'

export type ReferenceCurveDataPoint = {dt: number, value: number}

export type ReferenceCurve = {
    pourCurve?: ReferenceCurveDataPoint[],
    extractCurve?: ReferenceCurveDataPoint[],
    pourLimit?: number,
    extractLimit?: number
    duration?: number
}

export type ReferenceCurveNumberOption = {
    viewOrder: number,
    displayName: string,
    defaultValue: number,
    value?: number,
    valueType: 'number',
    incrementStep: number,
    unit?: string | undefined
    minValue: number,
    maxValue: number,
}

export type ReferenceCurveSelectOption<T> = {
    viewOrder: number,
    displayName: string,
    defaultValue: T
    value?: T
    valueType: 'select',
    selections: { value: T, displayName: string }[],
    unit?: string
}

export type ReferenceCurveGeneratorArgument = Record<string, number|string>

export type ReferenceCurveOption = ReferenceCurveNumberOption | ReferenceCurveSelectOption<number> | ReferenceCurveSelectOption<string>

export type ReferenceCurveProperty = {
    generator: (arg0: any) => ReferenceCurve,
    name: string,
    options: Record<string, ReferenceCurveOption>
}

export const curveState = atom({
    key: 'referenceCurveState',
    default: {
        id: 'matsuya'
    } as { id: string }
})


const computeCurveDuration = ({
    pourCurve = [],
    extractCurve = []
}:{
    pourCurve?: ReferenceCurveDataPoint[],
    extractCurve?: ReferenceCurveDataPoint[]
}) => {
    const pourTMax = pourCurve.map((e) => e.dt).filter((e) => isFinite(e)).reduce((a, b) => a > b ? a : b, 0) || 0
    const extractTMax = extractCurve.map((e) => e.dt).filter((e) => isFinite(e)).reduce((a, b) => a > b ? a : b, 0) || 0
    return Math.max(pourTMax, extractTMax)
}

export const generateMatsuyaCurve = ({
    bloomingTime, coffeeWeight, pourRate, coffeeYieldRatio, dilutionFactor
}: {
    bloomingTime: number
    coffeeWeight: number
    pourRate: number
    coffeeYieldRatio: number
    dilutionFactor: number
}): ReferenceCurve => {
    const extractWeight = coffeeWeight * coffeeYieldRatio * dilutionFactor / 100
    const bloomingExtractWeight = 2 * coffeeWeight
    const bloomingPourWeight = 3 * coffeeWeight
    // absorption
    const absorptionAdjustmentWeight = 1 * coffeeWeight
    const absorptionDelay = absorptionAdjustmentWeight / pourRate

    const secondPourWeight = extractWeight - bloomingExtractWeight + absorptionAdjustmentWeight
    const secondPourTime = secondPourWeight / pourRate
    const secondExtractWeight = (extractWeight - bloomingExtractWeight)
    const secondExtractTime = secondExtractWeight / pourRate

    const pourCurve = [
        { dt: 0, value: 0 },
        { dt: 30, value: bloomingPourWeight },
        { dt: bloomingTime + 30, value: bloomingPourWeight },
        { dt: bloomingTime + 30 + absorptionDelay, value: bloomingPourWeight + absorptionAdjustmentWeight },
        { dt: bloomingTime + 30 + secondPourTime, value: bloomingPourWeight + secondPourWeight }
    ]
    const extractCurve = [
        // { dt: 0, value: 0 },
        { dt: 30, value: bloomingExtractWeight },
        { dt: bloomingTime + 30 + absorptionDelay, value: bloomingExtractWeight },
        { dt: bloomingTime + 30 + absorptionDelay + secondExtractTime, value: bloomingExtractWeight + secondExtractWeight }
    ]

    return ({
        pourCurve,
        extractCurve: [
            // { dt: 0, value: 0 },
            { dt: 30, value: bloomingExtractWeight },
            { dt: bloomingTime + 30 + absorptionDelay, value: bloomingExtractWeight },
            { dt: bloomingTime + 30 + absorptionDelay + secondExtractTime, value: bloomingExtractWeight + secondExtractWeight }
        ],
        extractLimit: coffeeWeight * coffeeYieldRatio,
        duration: computeCurveDuration({ pourCurve, extractCurve })
    })
}

export const generate46Curve = ({
    formerBalance, latterSteps, coffeeWeight, pourRate, coffeeWaterRatio
}: {
    formerBalance: number
    latterSteps: number
    coffeeWeight: number
    pourRate: number
    coffeeWaterRatio: number
}): ReferenceCurve => {
    const pourWeightPerStep = coffeeWeight * coffeeWaterRatio / 5
    const formerPourCurve = [
        { dt: 0, value: 0 },
        {
            dt: 0 + pourWeightPerStep * (1 + formerBalance / 100) / pourRate,
            value: pourWeightPerStep * (1 + formerBalance / 100)
        },
        {
            dt: 45,
            value: pourWeightPerStep * (1 + formerBalance / 100)
        },
        {
            dt: 45 + pourWeightPerStep * (1 - formerBalance / 100) / pourRate,
            value: pourWeightPerStep * 2
        }
    ]

    const latterPourTime = pourWeightPerStep * 3 / latterSteps / pourRate
    const latterPourStartTimes = Array.from(Array(latterSteps + 1).keys()).map((e) => e * 135 / latterSteps)
    const latterPourAmounts = Array.from(Array(latterSteps + 2).keys()).map((e) => ((e) * pourWeightPerStep * 3 / latterSteps + 2 * pourWeightPerStep))
    const latterPourCurve = latterPourStartTimes.map((e, i) => {
        return ([
            { dt: 90 + e, value: latterPourAmounts[i] },
            { dt: 90 + e + latterPourTime, value: latterPourAmounts[i + 1] }
        ])
    }).flatMap((e) => e).slice(0, -1)

    const pourCurve = [...formerPourCurve, ...latterPourCurve]

    return ({
        pourCurve,
        extractCurve: [],
        duration: computeCurveDuration({ pourCurve })
    })
}

export const generateNoneCurve = ({
    coffeeWeight, coffeeWaterRatio
}: {
    coffeeWeight: number
    coffeeWaterRatio: number
}): ReferenceCurve => {
    return ({
        pourCurve: [],
        extractCurve: [],
        pourLimit: coffeeWeight * coffeeWaterRatio,
    })
}

export const referenceCurvePropertiesState = atom({
    key: 'referenceCurvePropertiesState',
    default: {
        matsuya: {
            generator: generateMatsuyaCurve,
            name: 'Matsuya',
            options: {
                bloomingTime: {
                    viewOrder: 1,
                    displayName: 'Blooming Time',
                    defaultValue: 180,
                    valueType: 'number',
                    incrementStep: 15,
                    unit: 's',
                    minValue: 0,
                    maxValue: 600
                },
                pourRate: {
                    viewOrder: 2,
                    displayName: 'Pour Rate',
                    defaultValue: 3,
                    valueType: 'number',
                    incrementStep: 1,
                    unit: 'g/s',
                    minValue:0.1,
                    maxValue: 20
                },
                coffeeYieldRatio: {
                    viewOrder: 3,
                    displayName: 'Coffee/Yield Ratio',
                    defaultValue: 15,
                    valueType: 'number',
                    incrementStep: 1,
                    minValue:10,
                    maxValue:25
                },
                dilutionFactor: {
                    viewOrder: 4,
                    displayName: 'Dilution Factor',
                    defaultValue: 60,
                    valueType: 'number',
                    incrementStep: 5,
                    unit: '%',
                    minValue:30,
                    maxValue:100
                }
            },
        },
        method46: {
            generator: generate46Curve,
            name: '4:6 Method',
            options: {
                formerBalance: {
                    viewOrder: 1,
                    displayName: '1st Pour Adjustment',
                    defaultValue: 0,
                    valueType: 'number',
                    incrementStep: 5,
                    unit: '%',
                    minValue:-100,
                    maxValue: 100
                },
                latterSteps: {
                    viewOrder: 2,
                    displayName: 'Latter Steps',
                    defaultValue: 3,
                    valueType: 'select',
                    selections: [
                        { value: 1, displayName: '1' },
                        { value: 2, displayName: '2' },
                        { value: 3, displayName: '3' }
                    ]
                },
                pourRate: {
                    viewOrder: 3,
                    displayName: 'Pour Rate',
                    defaultValue: 10,
                    valueType: 'number',
                    incrementStep: 1,
                    unit: 'g/s',
                    minValue: 0.1,
                    maxValue: 20
                },
                coffeeWaterRatio: {
                    viewOrder: 4,
                    displayName: 'Coffee/Water Ratio',
                    defaultValue: 15,
                    valueType: 'number',
                    incrementStep: 1,
                    minValue: 10,
                    maxValue: 25
                }
            },
        },
        none: {
            generator: generateNoneCurve,
            name: 'None',
            options: {
                coffeeWaterRatio: {
                    viewOrder: 1,
                    displayName: 'Coffee/Water Ratio',
                    defaultValue: 15,
                    valueType: 'number',
                    incrementStep: 1,
                    minValue: 10,
                    maxValue: 25
                }
            }
        }
    } as Record<string, ReferenceCurveProperty>
})

export const referenceCurveGlobalOptionsState = atom({
    key: 'referenceCurveGlobalOptionsState',
    default: {
        coffeeWeight: {
            viewOrder: 1,
            displayName: 'Coffee Weight',
            defaultValue: 20,
            valueType: 'number',
            unit: 'g',
            incrementStep: 5,
            minValue: 5,
            maxValue: 100
        }
    } as Record<string, ReferenceCurveOption>
})

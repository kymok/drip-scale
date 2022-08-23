import { Snapshot, CallbackInterface } from 'recoil'
import { latestNMSecFastAverageDataSelector, latestFastAverageDataSelector } from './latestData'
import { pauseState, slowHistoryRetainPeriod, tareState, triggerState } from './daqModeStates'
import { calibratorSelector, sensorOffsetSelector } from './calibrator'

export const tare = async (
    snapshot: Snapshot,
    sensorId: string,
    set: CallbackInterface['set']
) => {
    const tare = await snapshot.getPromise(tareState)
    if (tare[sensorId]?.shouldTare) {
        const history = (await snapshot.getPromise(latestNMSecFastAverageDataSelector({ sensorId, msec: tare[sensorId].sampleLengthMs }))) || []
        const readings = history.map((e) => e.reading)

        if (readings.length > 5) {
            const mean = readings.reduce((a: number, b: number) => a + b) / readings.length
            const variance = readings.map((e) => e - mean).map((e) => e * e).reduce((a, b) => a + b) / readings.length
            const stddev = Math.sqrt(variance)
            if (stddev < tare[sensorId].stddev) {
                const newTare = { ...tare, [sensorId]: { ...tare[sensorId], shouldTare: false } }
                set(tareState, newTare)
                set(sensorOffsetSelector(sensorId), mean)
                console.log(`Tare ${sensorId} Done`)
            } else {
                console.warn(`Tare ${sensorId} Failed: Weight not stable enough. stddev: ${stddev}`)
            }
        } else {
            console.warn(`Tare ${sensorId} Failed: No sufficient number of samples.`)
        }
    }
}

export const trigger = async (
    snapshot: Snapshot,
    sensorId: string,
    set: CallbackInterface['set']
) => {
    const trigger = await snapshot.getPromise(triggerState)
    const tare = await snapshot.getPromise(tareState)
    const shouldTare = tare[sensorId]?.shouldTare
    // Do not trigger while tare
    if (!shouldTare && trigger.channel === sensorId) {
        const history = await snapshot.getPromise(latestNMSecFastAverageDataSelector({ sensorId, msec: trigger.triggerWindowSize }))
        const calibrator = await snapshot.getPromise(calibratorSelector(sensorId))
        const calibratedReadings = history?.map((e) => calibrator(e?.reading)) || []

        if (trigger.standby) {
            const triggerableReadings = calibratedReadings.slice(-trigger.nConsecutiveSamples)
            if (triggerableReadings.length >= trigger.nConsecutiveSamples) {
                const shouldTrigger = triggerableReadings.map((e) => e > trigger.threshold).reduce((a, b) => a && b)
                if (shouldTrigger) {
                    const latestTimestamp = history?.at(-1)?.timestamp
                    set(triggerState, { ...trigger, standby: false, timestamp: latestTimestamp ?? null })
                    console.log(`Trig'd at ${latestTimestamp}`)
                }
            }
        }
    }
}

export const autoStop = async (
    snapshot: Snapshot,
    sensorId: string,
    set: CallbackInterface['set']
): Promise<boolean> => {
    const historyRetainPeriod = await snapshot.getPromise(slowHistoryRetainPeriod)
    const trigger = await snapshot.getPromise(triggerState)
    const triggerTimestamp = trigger?.timestamp
    if (triggerTimestamp) {
        const latestMeasurement = await snapshot.getPromise(latestFastAverageDataSelector(sensorId))
        const latestTimestamp = latestMeasurement?.timestamp || NaN
        if (latestTimestamp - triggerTimestamp > historyRetainPeriod) {
            // STOP
            console.log('Auto STOP')
            set(pauseState, {isPaused: true, reason: 'autostop'})
            return true
        }
    }
    return false
}

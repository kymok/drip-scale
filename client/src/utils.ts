import { DefaultValue } from 'recoil'

export const isRecoilDefaultValue = (
    candidate: any
): candidate is DefaultValue => {
    if (candidate instanceof DefaultValue) return true
    return false;
}

export const lerp = (
    x0:number,
    x1:number,
    y0:number,
    y1:number,
    x: number
): number => {
    return (y1 - y0) * (x - x0) / (x1 - x0) + y0
}

export const bisectLeft = (
    arr: number[],
    x: number
): number => {
    let left = 0
    let right = arr.length
    while(left<right){
        const mid = left + Math.floor((right-left) / 2)
        if (arr[mid] < x) {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}
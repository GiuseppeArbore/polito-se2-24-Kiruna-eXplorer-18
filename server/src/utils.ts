import { DocCoords, Scale } from "./models/model";
import { AreaType, ScaleType } from "./models/enum";

export const KIRUNA_COORDS: [number, number] = [20.26, 67.845];

function deg2rad(p: number): number {
    return p * (Math.PI / 180);
}

/**
 * Computes the distance between two points
 * @param p1 Tuple containing [latitude, longitude], in degrees
 * @param p2 Tuple containing [latitude, longitude], in degrees
 * @returns The distance between the points, in Km
 */
export function coordDistance(p1: [number, number], p2: [number, number]): number {
    p1 = [deg2rad(p1[0]), deg2rad(p2[1])];
    p2 = [deg2rad(p2[0]), deg2rad(p2[1])];

    return 6371 * Math.acos(
        Math.sin(p1[0]) * Math.sin(p2[0]) + Math.cos(p1[0]) *
        Math.cos(p2[0]) * Math.cos(p2[1] - p1[1])
    );
}

export function isScale(sc: any): sc is Scale {
    return (
        (sc.type) &&
        (
            (sc.type === ScaleType.TEXT) ||
            (sc.type === ScaleType.BLUEPRINT_EFFECTS) ||
            (sc.type === ScaleType.ONE_TO_N && Number.isInteger(sc.scale))
        )
    )
}

export function isDocCoords(dc: any): dc is DocCoords {
    return (
        (dc.type) &&
        (dc.type === AreaType.POINT &&
            Object.keys(dc).length === 2 &&
            dc.coordinates &&
            Array.isArray(dc.coordinates) &&
            dc.coordinates.every((c: any) => typeof c === "number")) ||
        (dc.type === AreaType.AREA &&
            Object.keys(dc).length === 2 &&
            dc.coordinates &&
            Array.isArray(dc.coordinates) &&
            dc.coordinates.every(
                (c: any) =>
                    Array.isArray(c) &&
                    c.every(
                        (c: any) =>
                            Array.isArray(c) && c.every((c: any) => typeof c === "number")
                    )
            )) ||
        (dc.type === AreaType.ENTIRE_MUNICIPALITY && Object.keys(dc).length === 1)
    );
}
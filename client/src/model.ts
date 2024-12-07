import { AreaType } from "./enum";
import { mongoose, Ref } from "@typegoose/typegoose";
const prop = (..._: any) => (_: any, _a: string) => {};
const modelOptions = (..._: any) => (_: any) => {};

export type PageRange = [number, number] | number;

@modelOptions({
    schemaOptions: {
        _id: false,
    },
})
export class DateRange {
    @prop({required: true, type: Date})
    from!: Date;

    @prop({required: false, type: Date})
    to?: Date;
}

@modelOptions({
    schemaOptions: {
        _id: false,
    },
})
class Connections {

    @prop({required: true, ref: () => KxDocument})
    direct!: Ref<KxDocument>[];

    @prop({required: true, ref: () => KxDocument})
    collateral!: Ref<KxDocument>[];

    @prop({required: true, ref: () => KxDocument})
    projection!: Ref<KxDocument>[];

    @prop({required: true, ref: () => KxDocument})
    update!: Ref<KxDocument>[];
}

@modelOptions({
    schemaOptions: {
        discriminatorKey: "type",
        _id: false,
    },
})
class DocCoordsBase {
    @prop({required: true, type: String, enum: AreaType})
    type!: AreaType
}

export class Point extends DocCoordsBase {
    declare type: AreaType.POINT

    @prop({required: true, type: [Number]})
    coordinates!: number[]
}

export class Area extends DocCoordsBase {
    declare type: AreaType.AREA

    @prop({required: true, type: [[[Number]]]})
    coordinates!: number[][][]
}

export class WholeMunicipality extends DocCoordsBase {
    declare type: AreaType.ENTIRE_MUNICIPALITY
}

export type DocCoords = Point | Area | WholeMunicipality;

@modelOptions({
    schemaOptions: {
        collection: "documents"
    },
})
export class KxDocument {
    _id?: mongoose.Types.ObjectId;

    @prop({required: true, type: String})
    title!: string;

    @prop({required: true, type: String})
    stakeholders!: string[];

    @prop({required: true, type: Number})
    scale!: number;

    @prop({required: true, type: DateRange})
    issuance_date!: DateRange;

    @prop({required: true, type: String})
    type!: string;

    @prop({type: String})
    language?: string;

    @prop({
        required: true,
        type: DocCoordsBase,
        discriminators: () => [
            {type: Point, value: AreaType.POINT},
            {type: Area, value: AreaType.AREA},
            {type: WholeMunicipality, value: AreaType.ENTIRE_MUNICIPALITY},
        ]
    })
    doc_coordinates!: DocCoordsBase;

    @prop({required: true, type: String})
    description!: string;

    // TODO: use proper schema and validate
    @prop({type: [mongoose.Schema.Types.Mixed], validate: () => {}})
    pages?: PageRange[];

    @prop({required: true, type: Connections})
    connections!: Connections;

    @prop({type: String})
    attachments?: string[];
}

export interface KxDocumentAggregateData {
    stakeholders: string[];
    types: string[];
    scales: number[];
}
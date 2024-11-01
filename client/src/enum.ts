export enum Stakeholders {
    URBAN_DEVELOPER = "Urban Developer",
    URBAN_PLANNER = "Urban Planner",
    RESIDENT = "Resident",
    VISITOR = "Visitor"

}

export enum Scale {
    TEXT = "Text",
    LARGE_ARCHITECTURAL = "Large Architectural Scale",
    SMALL_ARCHITECTURAL = "Small Architectural Scale"
}

export enum KxDocumentType {
    INFORMATIVE = "Informative document",
    PRESCRIPTIVE = "Prescriptive Document",
    DESIGN = "Design document",
    TECHNICAL = "Technical document",
    STRATEGY = "Strategy document",
    AGREEMENT = "Agreement document",
    CONFLICT = "Conflict resolution document",
    CONSULTATION = "Consultation document",
}

export enum AreaType {
    ENTIRE_MUNICIPALITY = "The entire municipality of Kiruna",
    POINT = "A point in Kiruna",
    AREA = "An area in Kiruna"
}

export type PageRange = [number, number] | number;
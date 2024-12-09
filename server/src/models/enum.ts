export enum Stakeholders {
    URBAN_DEVELOPER = "Urban Developer",
    URBAN_PLANNER = "Urban Planner",
    RESIDENT = "Resident",
    VISITOR = "Visitor"
}

export enum ScaleType {
    TEXT = "Text",
    BLUEPRINT_EFFECTS = "Blueprint/Effects",
    ONE_TO_N = "1:N"
}

export enum KxDocumentType {
    INFORMATIVE = "Informative Document",
    PRESCRIPTIVE = "Prescriptive Document",
    DESIGN = "Design Document",
    TECHNICAL = "Technical Document",
    STRATEGY = "Strategy",
    AGREEMENT = "Agreement",
    CONFLICT = "Conflict Resolution",
    CONSULTATION = "Consultation",
}

export enum AreaType {
    ENTIRE_MUNICIPALITY = "EntireMunicipality", //The entire municipality of Kiruna
    POINT = "Point", //A point in Kiruna
    AREA = "Polygon" //An area in Kiruna
}

import { describe, test } from "@jest/globals"
import { db } from "../src/db/dao";
import { AreaType, KxDocumentType, Language, Scale, Stakeholders } from "../src/models/enum";
import { KxDocument } from "../src/models/model";
import { ObjectId } from "mongodb";

const list:ObjectId[]  = [];

beforeAll(async () => {
   const res =  await db.createKxDocument({
        title: "title 1",
        stakeholders: [Stakeholders.RESIDENTS],
        scale: Scale.TEXT,
        issuance_date: 0,
        type: KxDocumentType.INFORMATIVE,
        connections: 0,
        language: Language.SWEDISH,
        area_type: AreaType.ENTIRE_MUNICIPALITY,
        description: "Test"
    } as KxDocument);
    if (res && res._id) {
        list.push(res._id);
    }
});

describe("Test DAO", () => {
    test("Test Create Document", async () => {
        const res = await db.createKxDocument({
            title: "title 2",
            stakeholders: [Stakeholders.RESIDENTS],
            scale: Scale.TEXT,
            issuance_date: 0,
            type: KxDocumentType.INFORMATIVE,
            connections: 0,
            language: Language.SWEDISH,
            area_type: AreaType.ENTIRE_MUNICIPALITY,
            description: "Test",
        })
        if (res && res._id) {
            list.push(res._id);
        }
        expect(res).toHaveProperty("_id");
    });

    test("Test Get Document By Title", async  () => {
        const res = await db.getKxDocumentByTitle("title 1");
        expect(res).toEqual({
            title: "title 1",
            _id: list[0],
            stakeholders: [Stakeholders.RESIDENTS],
            scale: Scale.TEXT,
            issuance_date: 0,
            type: KxDocumentType.INFORMATIVE,
            connections: 0,
            language: Language.SWEDISH,
            area_type: AreaType.ENTIRE_MUNICIPALITY,
            description: "Test"
        })
    });
    test("Test Get All Documents", async  () => {
        const res = await db.getAlldocuments();
        expect(res).toHaveLength(2);
    });

    test("Test Get Document By Id", async () => {
        const res = await db.getKxDocumentById(list[0].toString());
        expect(res).toEqual({
            title: "title 1",
            _id: list[0],
            stakeholders: [Stakeholders.RESIDENTS],
            scale: Scale.TEXT,
            issuance_date: 0,
            type: KxDocumentType.INFORMATIVE,
            connections: 0,
            language: Language.SWEDISH,
            area_type: AreaType.ENTIRE_MUNICIPALITY,
            description: "Test"
        })
    });
    test("Test Delete Document", async () => {
        console.log(list[0].toString());
        console.log(list[1].toString());
        const res = await db.deleteKxDocument(list[0].toString());
        const res2 = await db.deleteKxDocument(list[1].toString());
        expect(res).toBeTruthy();
        expect(res2).toBeTruthy();
    });

});

afterAll(async () => {
    await db.disconnectFromDB();
});
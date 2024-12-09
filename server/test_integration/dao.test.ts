import { describe, test } from "@jest/globals"
import { db } from "../src/db/dao";
import { AreaType, KxDocumentType, ScaleType, Stakeholders } from "../src/models/enum";
import { Area, KxDocument, Point, ScaleOneToN } from "../src/models/model";
import { User, UserModel } from "../src/models/user";
import { EJSON } from "bson";
import { mongoose } from "@typegoose/typegoose";
import { KIRUNA_COORDS } from "../src/utils";
import testUsers from "../test_users/db_export.kiruna-ex.users.json";

const TEST_FILENAME = "filename";

const list: mongoose.Types.ObjectId[] = [];
const date = new Date();
const deserializedTestUsers = EJSON.deserialize(testUsers);

let userIds: mongoose.Types.ObjectId[] = [];

beforeAll(async () => {
    const users = await UserModel.db.collection("users").insertMany(deserializedTestUsers);
    userIds = userIds.concat(Object.values(users.insertedIds));

    const res = await db.createKxDocument({
        title: "title 1",
        stakeholders: [Stakeholders.RESIDENT],
        scale: {
            type: ScaleType.ONE_TO_N,
            scale: 10
        },
        issuance_date: {
            from: date
        },
        type: KxDocumentType.INFORMATIVE,
        language: "Swedish",
        doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
        description: "Test",
        connections: {
            direct: [], collateral: [], projection: [], update: []
        },
    } as KxDocument);
    if (res && res._id) {
        list.push(res._id);
    }
});

describe("Test DAO", () => {
    test("Test Create Document", async () => {
        const res = await db.createKxDocument({
            title: "title 2",
            stakeholders: [Stakeholders.RESIDENT],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Swedish",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        })
        if (res && res._id) {
            list.push(res._id);
        }
        expect(res).toHaveProperty("_id");
    });

    test("Test Get Document By Title", async () => {
        const res = await db.getKxDocumentByTitle("title 1");
        expect(res).toMatchObject<KxDocument>({
            title: "title 1",
            _id: list[0],
            stakeholders: [Stakeholders.RESIDENT],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            pages: [],
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Swedish",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        })
    });
    test("Test Get All Documents", async () => {
        const res = await db.getAlldocuments();
        expect(res).toHaveLength(2);
    });

    test("Test Get Document By Id", async () => {
        const res = await db.getKxDocumentById(list[0]);
        expect(res).toMatchObject({
            title: "title 1",
            _id: list[0],
            stakeholders: [Stakeholders.RESIDENT],
            pages: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Swedish",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test"
        })
    });
    test("Test Delete Document", async () => {
        const res = await db.deleteKxDocument(list[0]);
        const res2 = await db.deleteKxDocument(list[1]);
        expect(res).toBeTruthy();
        expect(res2).toBeTruthy();
    });
    test("Test complex pages query", async () => {
        const res = await db.createKxDocument({
            title: "test",
            stakeholders: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 0
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Italian",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test",
            pages: [2, [4, 8]],
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        });
        if (res && res._id) {
            expect(res).toHaveProperty("_id");
            const get = await db.getKxDocumentById(res._id);
            expect(get?.pages).toEqual([2, [4, 8]]);
            const res2 = await db.deleteKxDocument(res._id);
            expect(res2).toBeTruthy();
        }
    });

    test("Test query with whole municipality coordinates", async () => {
        const res = await db.createKxDocument({
            title: "test",
            stakeholders: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 0
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Italian",
            doc_coordinates: {
                type: AreaType.ENTIRE_MUNICIPALITY,
            },
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        });
        if (res && res._id) {
            expect(res).toHaveProperty("_id");
            const get = await db.getKxDocumentById(res._id);
            expect(get?.doc_coordinates).toMatchObject({ type: AreaType.ENTIRE_MUNICIPALITY });
            const res2 = await db.deleteKxDocument(res._id);
            expect(res2).toBeTruthy();
        }
    });

    test("Test query with Point coordinates", async () => {
        const res = await db.createKxDocument({
            title: "test",
            stakeholders: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 0
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Italian",
            doc_coordinates: {
                type: AreaType.POINT,
                coordinates: [20.26, 67.845]
            } as Point,
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        });
        if (res && res._id) {
            expect(res).toHaveProperty("_id");
            const get = await db.getKxDocumentById(res._id);
            expect(get?.doc_coordinates).toMatchObject({ type: AreaType.POINT, coordinates: [20.26, 67.845] });
            const res2 = await db.deleteKxDocument(res._id);
            expect(res2).toBeTruthy();
        }
    });

    test("Test query with Area (Polygons)", async () => {
        const res = await db.createKxDocument({
            title: "test",
            stakeholders: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 0
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Italian",
            doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.5)]] } as Area,
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        });
        if (res && res._id) {
            expect(res).toHaveProperty("_id");
            const get = await db.getKxDocumentById(res._id);
            expect(get?.doc_coordinates).toMatchObject({ type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.5)]] });
            const res2 = await db.deleteKxDocument(res._id);
            expect(res2).toBeTruthy();
        }
    });

    test("Test adding attachments to existing document", async () => {
        const id = new mongoose.Types.ObjectId();
        const tmpDoc = {
            _id: id,
            title: "test",
            stakeholders: [],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 0
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Italian",
            doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.5)]] } as Area,
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        } as KxDocument;

        await db.createKxDocument(tmpDoc);
        await db.addKxDocumentAttachments(id, ["test1", "test2"]);
        const addRes = await db.getKxDocumentById(id);
        expect(addRes).toMatchObject({
            ...tmpDoc,
            attachments: ["test1", "test2"]
        } as KxDocument);

        const res2 = await db.deleteKxDocument(id);
        expect(res2).toBeTruthy();
    });
    test("Get user by email", async () => {
        const user = deserializedTestUsers[0];
        const res = await db.getUserByEmail(user.email);

        expect(
            {
                ...res,
                password: res?.password.toString("base64"),
                salt: res?.salt.toString("base64")
            }
        ).toMatchObject(
            {
                ...user,
                password: user.password.toString("base64"),
                salt: user.salt.toString("base64")
            }
        );
    });
    test("Remove attachment", async () => {
        const doc: KxDocument = {
            title: "title 1",
            stakeholders: [Stakeholders.RESIDENT],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Swedish",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            }
        };
        const resCreation = await db.createKxDocument({
            ...doc,
            attachments: [
                TEST_FILENAME
            ]
        } as KxDocument);
        expect(resCreation).toBeTruthy();

        const res = await db.removeKxDocumentAttachments(resCreation!._id!, [TEST_FILENAME]);
        const newDoc = await db.getKxDocumentById(resCreation!._id!);

        expect(res).toBeTruthy();
        expect(newDoc).toMatchObject({
            ...doc,
            attachments: [],
            _id: resCreation!._id!
        });
        const res2 = await db.deleteKxDocument(resCreation!._id!);
        expect(res2).toBeTruthy();
    });
    test("Remove non existing attachment", async () => {
        const doc: KxDocument = {
            title: "title 1",
            stakeholders: [Stakeholders.RESIDENT],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: KxDocumentType.INFORMATIVE,
            language: "Swedish",
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            }
        };
        const resCreation = await db.createKxDocument({
            ...doc,
            attachments: [
            ]
        } as KxDocument);
        expect(resCreation).toBeTruthy();

        const res = await db.removeKxDocumentAttachments(resCreation!._id!, [TEST_FILENAME]);
        const newDoc = await db.getKxDocumentById(resCreation!._id!);

        expect(res).toBeFalsy();
        expect(newDoc).toMatchObject({
            ...doc,
            attachments: [],
            _id: resCreation!._id!
        });
        const res2 = await db.deleteKxDocument(resCreation!._id!);
        expect(res2).toBeTruthy();
    });
    test("Get aggragate data", async () => {

        const id = new mongoose.Types.ObjectId();
        const tmpDoc = {
            _id: id,
            title: "test",
            stakeholders: [Stakeholders.RESIDENT, "Custom SH"],
            scale: {
                type: ScaleType.ONE_TO_N,
                scale: 10
            } as ScaleOneToN,
            issuance_date: {
                from: date
            },
            type: "Custom type",
            language: "Italian",
            doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.5)]] } as Area,
            description: "Test",
            connections: {
                direct: [], collateral: [], projection: [], update: []
            },
        } as KxDocument;

        await db.createKxDocument(tmpDoc);
        const res = await db.getKxDocumentsAggregateData();

        const res2 = await db.deleteKxDocument(id);
        expect(res2).toBeTruthy();
        expect(res).toBeTruthy();
        res!.stakeholders.sort();
        expect(res).toMatchObject({
            scales: [
                10,
            ],
            stakeholders: [
                "Custom SH",
                "Resident",
            ],
            types: [
                "Custom type",
            ],
        });
    });
});

afterAll(async () => {
    for (const id of userIds) {
        await db.deleteUser(id);
    }

    await db.disconnectFromDB();
});
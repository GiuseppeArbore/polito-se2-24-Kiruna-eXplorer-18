import { describe, test } from "@jest/globals"
import request from 'supertest';
import { app } from "../index";
import { AreaType, KxDocumentType, Scale, Stakeholders } from "../src/models/enum";
import { KxDocument } from "../src/models/model";
import { db } from "../src/db/dao";
import { KIRUNA_COORDS } from "../src/utils";
import { mongoose } from "@typegoose/typegoose";
import testUsers from "../test_users/db_export.kiruna-ex.users.json";
import testLogins from "../test_users/user_login.json";
import { UserModel } from "../src/models/user";
import { EJSON } from "bson";

const TEST_ID = "6738b18f8da44b335177509e";
const TEST_FILENAME = "filename";

const date = new Date();
let documentIds: mongoose.Types.ObjectId[] = [];
let userIds: mongoose.Types.ObjectId[] = [];
let urbanPlannerCookie: string;

async function createUserAndGetCookie() {
    const users = await UserModel.db.collection("users").insertMany(EJSON.deserialize(testUsers));
    userIds = userIds.concat(Object.values(users.insertedIds));
    const res = await request(app)
        .post("/api/sessions")
        .send(testLogins[0])
        .expect(201);
    return res.header["set-cookie"][0];
}

beforeAll(async () => {
    urbanPlannerCookie = await createUserAndGetCookie();
})

describe("Integration Tests for Document API", () => {

    afterAll(async () => {
        for (const id of documentIds) {
            await db.deleteKxDocument(id);
        }
        for (const id of userIds) {
            await db.deleteUser(id);
        }

        await db.disconnectFromDB();
    });

    test("Test 1 - Should create a new document", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT, "Custom SH"],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document for integration testing.",
                pages: [],
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                },
            } as KxDocument);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe("Integration Test Document");

        documentIds.push(response.body._id);
    });

    test("Test 2 - Should fail to create a document with missing required fields (title)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document with missing title.",
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                },
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Title is required');
    });


    test("Test 3 - Should not create a new document if i send an already existing _id", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                _id: documentIds[0],
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document for integration testing.",
                pages: [],
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                },
            } as KxDocument);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error', status: 500 });
    });

    test("Test 4 - Should return 500 if there is a database error", async () => {

        const originalCreateKxDocument = db.createKxDocument;
        db.createKxDocument = async () => {
            const error = new Error('Database error');
            (error as any).customCode = 500;
            throw error;
        };

        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                _id: documentIds[0],
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document for integration testing.",
                pages: [],
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            } as KxDocument);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error', status: 500 });


        db.createKxDocument = originalCreateKxDocument;
    });


    test("Test 5 - Should fail to create a document with multiple missing required fields (title,stakeholders)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document with missing title.",
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Title is required');
        expect(response.body.errors[1].msg).toBe('Stakeholders are required');
    });

    test("Test 6 - Should fail to create a document (area outside of allowed radius)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.POINT, coordinates: [0, 0] },
                description: "This is a test document with missing title."
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Invalid document coordinates');
    });

    test("Test 7 - Should fail (area overlapping border)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, [0, 0], [1, 1]]] },
                description: "This is a test document with missing title."
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Invalid document coordinates');
    });

    test("Test 8 - Should succeed (correct area)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date,
                },
                type: "Custom type",
                language: "Swedish",
                doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.1)]] },
                description: "Test document",
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            } as KxDocument);
        documentIds.push(response.body._id);

        expect(response.status).toBe(201);
    });


    test("Test 9 - Should fetch multiple documents", async () => {

        const responsePost1 = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Document 1",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date,
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.1)]] },
                description: "Test document 1",
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            } as KxDocument);
        documentIds.push(responsePost1.body._id);
        const responsePost2 = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Document 2",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, KIRUNA_COORDS.map(c => c + 0.5), KIRUNA_COORDS.map(c => c - 0.1)]] },
                description: "Test document 2",
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            });

        documentIds.push(responsePost2.body._id);
        const response = await request(app).get('/api/documents');


        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toEqual(4);
        expect(response.body.some((doc: KxDocument) => doc.title === "Integration Test Document")).toBe(true);
        expect(response.body.some((doc: KxDocument) => doc.title === "Integration Test Document")).toBe(true);
        expect(response.body.some((doc: KxDocument) => doc.title === "Document 1")).toBe(true);
        expect(response.body.some((doc: KxDocument) => doc.title === "Document 2")).toBe(true);
    });

    test("Test 10 - Should fetch a document with specified id", async () => {
        const postResponse = await request(app)
            .post('/api/documents')
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "Test Document for Fetch",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: date,
                },
                type: KxDocumentType.INFORMATIVE,
                language: "Swedish",
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: "This is a test document for fetching.",
                pages: [],
                connections: {
                    direct: [], collateral: [], projection: [], update: []
                }
            } as KxDocument);

        documentIds.push(postResponse.body._id);
        expect(postResponse.status).toBe(201);
        const documentId = postResponse.body._id;

        const getResponse = await request(app).get(`/api/documents/${documentId}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body).toBeDefined();
        expect(getResponse.body.title).toBe("Test Document for Fetch");
        expect(getResponse.body.stakeholders).toEqual([Stakeholders.RESIDENT]);
        expect(getResponse.body.scale).toBe(10);
        expect(getResponse.body.issuance_date).toMatchObject({ from: date.toISOString() });
        expect(getResponse.body.type).toBe(KxDocumentType.INFORMATIVE);
        expect(getResponse.body.language).toBe("Swedish");
        expect(getResponse.body.doc_coordinates).toEqual({ type: AreaType.ENTIRE_MUNICIPALITY });
        expect(getResponse.body.description).toBe("This is a test document for fetching.");
        expect(getResponse.body.pages).toEqual([]);
    });

    test("Test 11 - Add attachments to non existing document", async () => {
        const file = Buffer.from("test data");
        const response = await request(app)
            .post(`/api/documents/${TEST_ID}/attachments`)
            .set("Cookie", urbanPlannerCookie)
            .attach("attachments", file, TEST_FILENAME);

        expect(response.status).toBe(404);
    });
    test("Test 12 - Remove attachment from non existing document", async () => {
        const response = await request(app)
            .delete(`/api/documents/${TEST_ID}/attachments/${TEST_FILENAME}`)
            .set("Cookie", urbanPlannerCookie);

        expect(response.status).toBe(404);
    });

    test('Test 13 - get aggregate data (no auth)', async () => {
        const response = await request(app)
            .get(`/api/documents/aggregateData`)
            .send();

        expect(response.status).toBe(401);
    });

    test('Test 14 - get aggregate data', async () => {
        const response = await request(app)
            .get(`/api/documents/aggregateData`)
            .set("Cookie", urbanPlannerCookie)
            .send();

        response.body.types.sort();
        response.body.stakeholders.sort();

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            scales: [
                10,
            ],
            stakeholders: [
                "Custom SH",
                "Resident",
                "Urban Developer",
                "Urban Planner",
                "Visitor",
            ],
            types: [
                "Agreement",
                "Conflict Resolution",
                "Consultation",
                "Custom type",
                "Design Document",
                "Informative Document",
                "Prescriptive Document",
                "Strategy",
                "Technical Document",
            ],
        });
    });

    test('Test 15 - set document description', async () => {
        const response = await request(app)
            .put(`/api/documents/${documentIds[0].toString()}/description`)
            .set("Cookie", urbanPlannerCookie)
            .send({
                description: "test description"
            });

        expect(response.status).toBe(200);
        expect(response.body.description).toBe("test description");
    });

    test('Test 16 - set document description of non existing document', async () => {
        const response = await request(app)
            .put(`/api/documents/${TEST_ID}/description`)
            .set("Cookie", urbanPlannerCookie)
            .send({
                description: "test description"
            });

        expect(response.status).toBe(404);
    });

    test('Test 17 - set document info', async () => {
        const response = await request(app)
            .put(`/api/documents/${documentIds[0].toString()}/info`)
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "new title",
                stakeholders: ["stake"],
                scale: 10_000,
                type: "asdf",
                language: "Italian",
                pages: [],
                doc_coordinates: {
                    type: AreaType.ENTIRE_MUNICIPALITY
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.description).toBe("test description");
    });

    test('Test 18 - set document info of non existing document', async () => {
        const response = await request(app)
            .put(`/api/documents/${TEST_ID}/info`)
            .set("Cookie", urbanPlannerCookie)
            .send({
                title: "new title",
                stakeholders: ["stake"],
                scale: 10_000,
                type: "asdf",
                language: "Italian",
                pages: [],
                doc_coordinates: {
                    type: AreaType.ENTIRE_MUNICIPALITY
                }
            });

        expect(response.status).toBe(404);
    });

    test('Test 19 - get non existing document', async () => {
        const response = await request(app)
            .get(`/api/documents/${TEST_ID}`)
            .set("Cookie", urbanPlannerCookie)
            .send();

        expect(response.status).toBe(404);
    });
});


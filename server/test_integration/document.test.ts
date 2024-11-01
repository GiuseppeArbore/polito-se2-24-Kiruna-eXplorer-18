import { describe, test } from "@jest/globals"
import request from 'supertest';
import {app} from "../index";
import { AreaType, KxDocumentType, Scale, Stakeholders } from "../src/models/enum";
import {db} from "../src/db/dao";



const date = new Date();
let documentIds: string[] = [];

describe("Integration Tests for Document API", () => {
    
    afterAll(async () => {

        for (const id of documentIds) {
            await db.deleteKxDocument(id);
        }

        await db.disconnectFromDB();
    });

    test("Test 1 - Should create a new document", async () => {
        const response = await request(app)
            .post('/api/documents')
            .send({
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: "Swedish",
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: "This is a test document for integration testing."
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe("Integration Test Document");

        documentIds.push(response.body._id);
    });

    test("Test 2 - Should fail to create a document with missing required fields (title)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .send({
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: "Swedish",
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: "This is a test document with missing title."
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Title is required');
    });


    test("Test 3 - Should not create a new document if i send an already existing _id", async () => {
        const response = await request(app)
            .post('/api/documents')
            .send({
                _id: documentIds[0],
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: "Swedish",
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: "This is a test document for integration testing."
            });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Internal Server Error', status: 400 });
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
            .send({
                _id: documentIds[0],
                title: "Integration Test Document",
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: "Swedish",
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: "This is a test document for integration testing."
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error', status: 500 });

        
        db.createKxDocument = originalCreateKxDocument;
    });


    test("Test 5 - Should fail to create a document with multiple missing required fields (title,stakeholders)", async () => {
        const response = await request(app)
            .post('/api/documents')
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: date,
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: "Swedish",
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: "This is a test document with missing title."
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].msg).toBe('Title is required');
        expect(response.body.errors[1].msg).toBe('Stakeholders are required');
    });

});


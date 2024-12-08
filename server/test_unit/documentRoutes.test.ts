import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { createKxDocument } from '../src/controller';
import * as cnt from "../src/controller";
import { app } from "../index";
import { db } from '../src/db/dao'
import { AreaType, KxDocumentType, Scale, Stakeholders } from '../src/models/enum';
import { KIRUNA_COORDS } from '../src/utils';
import { randomBytes } from 'crypto';
import { isUrbanPlanner } from '../src/auth';

const TEST_ID = "6738b18f8da44b335177509e";
const TEST_FILENAME = "filename";

jest.mock('../src/controller', () => ({
    ...jest.requireActual("../src/controller"),
    createKxDocument: jest.fn(),
    handleFileUpload: jest.fn(),
    removeAttachmentFromDocument: jest.fn(),
    getKxDocumentAggregateData: jest.fn()
}));
jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("../src/auth", () => ({
    ...jest.requireActual("../src/auth"),
    isUrbanPlanner: jest.fn((_req, _res, next) => {
        next();
    })
}));

describe('Document Routes', () => {
    afterAll(async () => {
        await db.disconnectFromDB();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Test 1 - POST /api/documents - should create a new document', async () => {
        const mockDocument = {
            _id: '12345',
            title: 'Unit Test Document',
            stakeholders: [Stakeholders.RESIDENT],
            scale_info: Scale.TEXT,
            scale: 10,
            issuance_date: {
                from: new Date().toISOString()
            },
            type: KxDocumentType.INFORMATIVE,
            language: 'Swedish',
            doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
            description: 'This is a test document for unit testing.',
            pages: [],
            connections: {
                direct: ['1'],
                collateral: ['2'],
                projection: ['3'],
                update: ['4']
            }
        };

        (createKxDocument as jest.Mock).mockImplementation((req: Request, res: Response) => {
            res.status(201).json(mockDocument);
        });

        const response = await request(app)
            .post('/api/documents')
            .send({
                title: 'Unit Test Document',
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: 'This is a test document for unit testing.',
                pages: [],
                connections: {
                    direct: ['1'],
                    collateral: ['2'],
                    projection: ['3'],
                    update: ['4']
                }
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id', '12345');
        expect(response.body.title).toBe('Unit Test Document');
    });

    test('Test 2 - POST /api/documents - should return error 400 (missing title)', async () => {


        const response = await request(app)
            .post('/api/documents')
            .send({
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: 'This is a test document unit testing.',

            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Title is required');
    });

    test('Test 3 - POST /api/documents - should return error 400 (missing title,stakeholders)', async () => {

        const response = await request(app)
            .post('/api/documents')
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: 'This is a test document for unit testing.',
            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Title is required');
        expect(response.body.errors[1].msg).toBe('Stakeholders are required');
    });

    test('Test 4 - POST /api/documents - should return error 400 (coordinates too far)', async () => {

        const response = await request(app)
            .post('/api/documents')
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.POINT, coordinates: [0, 0] },
                description: 'This is a test document for unit testing.',
            });

        expect(response.status).toBe(400);
    });

    test('Test 5 - POST /api/documents - should return error 400 (polygon partially outside of range)', async () => {

        const response = await request(app)
            .post('/api/documents')
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.AREA, coordinates: [[KIRUNA_COORDS, [0, 0], [0, 0]]] },
                description: 'This is a test document for unit testing.',
            });

        expect(response.status).toBe(400);
    });

    test('Test 6 - POST /api/documents - should return error 400 (connection validation)', async () => {
        const response = await request(app)
            .post('/api/documents')
            .send({
                title: 'Unit Test Document',
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: {
                    from: new Date().toISOString()
                },
                type: KxDocumentType.INFORMATIVE,
                language: 'Swedish',
                doc_coordinates: { type: AreaType.ENTIRE_MUNICIPALITY },
                description: 'This is a test document unit testing.',
                connections: {
                    direct: ['1', '2'],
                    collateral: ['2'],
                    projection: ['3'],
                    update: ['4']
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Invalid connections');
    }
    );

    test('Test 7 - POST /api/documents/:id/attachments - nominal case', async () => {
        jest.spyOn(cnt, "handleFileUpload").mockImplementation(
            jest.fn(async (req: Request, res: Response, next: NextFunction) => {
                res.status(201).send();
                return;
            })
        );
        const file = Buffer.from("test data");
        const response = await request(app)
            .post(`/api/documents/${TEST_ID}/attachments`)
            .attach("attachments", file, TEST_FILENAME);

        expect(response.status).toBe(201);
        expect(cnt.handleFileUpload).toHaveBeenCalledTimes(1);
    });

    test('Test 8 - POST /api/documents/:id/attachments - invalid id', async () => {
        jest.spyOn(cnt, "handleFileUpload").mockImplementation(
            jest.fn(async (req: Request, res: Response, next: NextFunction) => {
                res.status(201).send();
                return;
            })
        );
        const file = Buffer.from("test data");
        const response = await request(app)
            .post(`/api/documents/nonvalidid/attachments`)
            .attach("attachments", file, TEST_FILENAME);

        expect(response.status).toBe(400);
        expect(cnt.handleFileUpload).toHaveBeenCalledTimes(0);
    });

    test('Test 9 - POST /api/documents/:id/attachments - file too big', async () => {
        jest.spyOn(cnt, "handleFileUpload").mockImplementation(
            jest.fn(async (req: Request, res: Response, next: NextFunction) => {
                res.status(201).send();
                return;
            })
        );
        const file = randomBytes(11 * 1024 * 1024);
        const response = await request(app)
            .post(`/api/documents/${TEST_ID}/attachments`)
            .attach("attachments", file, TEST_FILENAME);

        expect(response.status).toBe(500);
        expect(cnt.handleFileUpload).toHaveBeenCalledTimes(0);
    });

    test("Test 10 - DELETE /api/documents/:id/attachments/:fileName - nominal case", async () => {
        jest.spyOn(cnt, "removeAttachmentFromDocument").mockImplementation(
            jest.fn(async (req: Request, res: Response, next: NextFunction) => {
                res.status(200).send();
                return;
            })
        );
        const response = await request(app)
            .delete(`/api/documents/${TEST_ID}/attachments/${TEST_FILENAME}`)
            .send();

        expect(response.status).toBe(200);
        expect(cnt.removeAttachmentFromDocument).toHaveBeenCalledTimes(1);
    });
    test('Test 11 - GET /api/documents/aggregateData - get aggregate data', async () => {
        jest.spyOn(cnt, "getKxDocumentAggregateData").mockImplementation(
            jest.fn(async (req: Request, res: Response, next: NextFunction) => {
                res.status(200).send();
                return;
            })
        );
        const response = await request(app)
            .get(`/api/documents/aggregateData`)
            .send();

        expect(response.status).toBe(200);
        expect(cnt.getKxDocumentAggregateData).toHaveBeenCalledTimes(1);
    });

});
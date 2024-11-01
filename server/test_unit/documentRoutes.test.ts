import request from 'supertest';
import { Request, Response } from 'express';
import { createKxDocument } from '../src/controller';
import {app} from "../index";
import { AreaType, KxDocumentType, Scale, Stakeholders } from '../src/models/enum';


jest.mock('../src/controller', () => ({
    createKxDocument: jest.fn(),
}));


describe('Document Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Test 1 - POST /api/documents - should create a new document', async () => {
        const mockDocument = {
            _id: '12345',
            title: 'Integration Test Document',
            stakeholders: [Stakeholders.RESIDENT],
            scale_info: Scale.TEXT,
            scale: 10,
            issuance_date: new Date().toISOString(),
            type: KxDocumentType.INFORMATIVE,
            connections: 0,
            language: 'Swedish',
            area_type: AreaType.ENTIRE_MUNICIPALITY,
            description: 'This is a test document for integration testing.',
        };

        jest.mock('../src/errorHandlers', () => ({
            validateRequest: jest.fn().mockImplementation((req, res, next) => next())
        }));

        (createKxDocument as jest.Mock).mockImplementation((req: Request, res: Response) => {
            res.status(201).json(mockDocument);
        });

        const response = await request(app)
            .post('/api/documents')
            .send({
                title: 'Integration Test Document',
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: new Date().toISOString(),
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: 'Swedish',
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: 'This is a test document for integration testing.',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id', '12345');
        expect(response.body.title).toBe('Integration Test Document');
    });

   

    test('Test 2 - POST /api/documents - should return error 400 (missing title)', async () => {

        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation((fieldName: string) => {
                if (fieldName === 'title') {
                    return {
                        run: jest.fn().mockResolvedValue({
                            errors: [{ msg: 'Title is required', param: 'title', location: 'body' }]
                        })
                    };
                }
            })
        }));


        const response = await request(app)
            .post('/api/documents')
            .send({
                stakeholders: [Stakeholders.RESIDENT],
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: new Date().toISOString(),
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: 'Swedish',
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: 'This is a test document for integration testing.',
            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Title is required');
    });

    test('Test 3 - POST /api/documents - should return error 400 (missing title,stakeholders)', async () => {

        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation((fieldName: string) => {
                if (fieldName === 'title') {
                    return {
                        run: jest.fn().mockResolvedValue({
                            errors: [{ msg: 'Title is required', param: 'title', location: 'body' }]
                        })
                    };
                }
                if (fieldName === 'stakeholders') {
                    return {
                        run: jest.fn().mockResolvedValue({
                            errors: [{ msg: 'Stakeholders are requiredftygui', param: 'stakeholders', location: 'body' }]
                        })
                    };
                }
            })
        }));

        jest.mock('../src/errorHandlers', () => ({
    validateRequest: jest.fn().mockImplementation((req, res, next) => {
        req.validationErrors = [
            { msg: 'Title is required', param: 'title', location: 'body' },
            { msg: 'Stakeholders are requiredasdtfy', param: 'stakeholders', location: 'body' }
        ];
        return next();
    })
}));


        const response = await request(app)
            .post('/api/documents')
            .send({
                scale_info: Scale.TEXT,
                scale: 10,
                issuance_date: new Date().toISOString(),
                type: KxDocumentType.INFORMATIVE,
                connections: 0,
                language: 'Swedish',
                area_type: AreaType.ENTIRE_MUNICIPALITY,
                description: 'This is a test document for integration testing.',
            });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Title is required');
        expect(response.body.errors[1].msg).toBe('Stakeholders are required');
    });
    
});
import * as Bucket from "../src/object_storage/bucket"
import { app } from "../index";
import request from 'supertest';
import { db } from '../src/db/dao'
import { mongoose } from "@typegoose/typegoose";

const TEST_ID = "6738b18f8da44b335177509e";
const TEST_FILENAME = "filename";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("../src/object_storage/bucket");

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await db.disconnectFromDB();
});

describe("Bucket routes", () => {
    test("GET /api/documents/:id/presignedUrl/:fileName", async () => {
        jest.spyOn(Bucket, "getPresignedUrl").mockImplementation(async (docId: mongoose.Types.ObjectId, fileName: string): Promise<string> => {
            return `test_url_${docId.toString()}_${fileName}`;
        });

        const response = await request(app)
            .get(`/api/documents/${TEST_ID}/presignedUrl/${TEST_FILENAME}`)
            .send();

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ presignedUrl: `test_url_${TEST_ID}_${TEST_FILENAME}` });
        expect(Bucket.getPresignedUrl).toHaveBeenCalledTimes(1);
    });

    test("GET /api/documents/:id/presignedUrl/:fileName - filename containing invalid characters", async () => {
        const response = await request(app)
            .get(`/api/documents/${TEST_ID}/presignedUrl/aa${String.fromCodePoint(0)}\naa`)
            .send();

        expect(response.status).toBe(400);
        expect(Bucket.getPresignedUrl).toHaveBeenCalledTimes(0);
    });

    test("GET /api/documents/:id/presignedUrl/:fileName - filename containing DEL", async () => {
        const response = await request(app)
            .get(`/api/documents/${TEST_ID}/presignedUrl/aa${String.fromCodePoint(127)}\naa`)
            .send();

        expect(response.status).toBe(400);
        expect(Bucket.getPresignedUrl).toHaveBeenCalledTimes(0);
    });

    test("GET /api/documents/:id/presignedUrl/:fileName - file name too long", async () => {
        const response = await request(app)
            .get(`/api/documents/${TEST_ID}/presignedUrl/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
            .send();

        expect(response.status).toBe(400);
        expect(Bucket.getPresignedUrl).toHaveBeenCalledTimes(0);
    });
});
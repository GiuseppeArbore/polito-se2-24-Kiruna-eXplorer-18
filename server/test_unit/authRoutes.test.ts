import { app } from "../index";
import request from 'supertest';
import { db } from '../src/db/dao'
import passport from "passport";
import testLogins from "../test_users/user_login.json";

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await db.disconnectFromDB();
});

describe("Auth routes", () => {
    test("Invalid email address", async () => {
        jest.spyOn(passport, "authenticate").mockImplementation();

        const res = await request(app)
            .post("/api/sessions")
            .send({ ...testLogins[0], username: "wrongmail.com" });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].path).toBe("username");
        expect(res.body.errors[0].msg).toBe("Username must be a valide email address");
    });
    test("Missing email", async () => {
        jest.spyOn(passport, "authenticate").mockImplementation();

        const res = await request(app)
            .post("/api/sessions")
            .send({ password: testLogins[0].password });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].path).toBe("username");
        expect(res.body.errors[0].msg).toBe("Invalid value");
    });
    test("Missing password", async () => {
        jest.spyOn(passport, "authenticate").mockImplementation();

        const res = await request(app)
            .post("/api/sessions")
            .send({ username: testLogins[0].username });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].path).toBe("password");
        expect(res.body.errors[0].msg).toBe("Invalid value");
    });
});
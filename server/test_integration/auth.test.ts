import { describe, test } from "@jest/globals"
import request from 'supertest';
import { app } from "../index";
import { db } from "../src/db/dao";
import { mongoose } from "@typegoose/typegoose";
import testUsers from "../test_users/db_export.kiruna-ex.users.json";
import testLogins from "../test_users/user_login.json";
import { UserModel } from "../src/models/user";
import { EJSON } from "bson";

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

describe("Integration Tests for Auth API", () => {

    afterAll(async () => {
        for (const id of userIds) {
            await db.deleteUser(id);
        }

        await db.disconnectFromDB();
    });

    test("Successful login", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .send(testLogins[0])

        expect(res.status).toBe(201);
    });
    test("Incorrect email", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .send({ ...testLogins[0], username: "wrong@mail.com" })

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({ message: "Incorrect email and/or password" });
    });
    test("Incorrect password", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .send({ ...testLogins[0], password: "wrong pass" })

        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({ message: "Incorrect email and/or password" });
    });
    test("Get current session", async () => {
        const res = await request(app)
            .get("/api/sessions/current")
            .set("Cookie", urbanPlannerCookie)
            .send()

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ email: testUsers[0].email, role: testUsers[0].role })
    });
    test("Get current session withou being logged in", async () => {
        const res = await request(app)
            .get("/api/sessions/current")
            .send()

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBe("The user is not logged in");
    });
    test("Logout without being logged in", async () => {
        const res = await request(app)
            .delete("/api/sessions/current")
            .send()

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBe("The user is not logged in");
    });
    test("Logout", async () => {
        const res = await request(app)
            .delete("/api/sessions/current")
            .set("Cookie", urbanPlannerCookie)
            .send()

        expect(res.status).toBe(200);
    });
});

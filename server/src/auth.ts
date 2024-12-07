import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import { db } from "./db/dao";
import crypto from "node:crypto";
import utils from "node:util"
import { body } from 'express-validator';
import { LightUser } from "./models/user";
import { Application, NextFunction, Request, Response } from "express";
import { Stakeholders } from "./models/enum";
import { validateRequest } from "./errorHandlers";

const disableAuth = process.env.DISABLE_AUTH?.trim() === "yes";
if (disableAuth) console.error("AUTH IS DISABLED!");

const pbkdf2 = utils.promisify(crypto.pbkdf2);

passport.use(new LocalStrategy.Strategy(async (email, password, cb) => {
    try {
        const user = await db.getUserByEmail(email);
        if (!user) return cb(null, false, { message: "Incorrect email and/or password" });

        const hashedPassword = await pbkdf2(password, user.salt, 310000, 16, "sha256");

        if (!crypto.timingSafeEqual(hashedPassword, user.password)) {
            return cb(null, false, { message: "Incorrect email and/or password" });
        }

        return cb(null, { email: user.email, role: user.role } as LightUser)
    } catch (e) {
        return cb(e);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser(async (user: LightUser, cb) => {
    try {
        const fullUser = await db.getUserByEmail(user.email);
        if (!fullUser) return cb(null, false);
        cb(null, {email: fullUser.email, role: fullUser.role} as LightUser);
    } catch (e) {
        return cb(e);
    }
});

export function initAuthRoutes(app: Application) {
    app.use(session({
        secret: "softwareengineering2secret",
        resave: false,
        saveUninitialized: false,
        //cookie: { secure: true } // Only enable with https
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.post(
        "/api/sessions",
        [
            body("username").notEmpty().isString().isEmail().withMessage("Username must be a valide email address"),
            body("password").notEmpty().isString().withMessage("Password is required")
        ],
        validateRequest,
        (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate("local", (err: any, user: any, info: any) => {
                if (err) return res.status(401).json(err);
                if (!user) return res.status(401).json(info);

                req.login(user, (err: any) => {
                    if (err) return res.status(401).json(err);
                    return res.status(201).json(req.user);
                });
            })(req, res, next);
        }
    );
    app.get(
        "/api/sessions/current",
        isLoggedIn,
        (req, res, _) => {
            res.status(200).json(req.user);
        }
    );
    app.delete("/api/sessions/current",
        isLoggedIn,
        (req, res, _) => {
        req.logout(() => res.end());
    });
}

export function isLoggedIn(req: Request, res: Response, next: NextFunction): void {
    if (disableAuth) {
        req.user = { email: "fake@fake.com", role: "Urban Planner" };
        return next();
    }

    if (req.isAuthenticated())
        return next();

    res.status(401).json({ error: "The user is not logged in", status: 401 });
};

export function isUrbanPlanner(req: Request, res: Response, next: NextFunction): void {
    if (disableAuth) {
        req.user = { email: "fake@fake.com", role: "Urban Planner" };
        return next();
    }

    const user = req.user as LightUser;
    if (req.isAuthenticated() && user.role === "Urban Planner")
        return next();

    res.status(401).json({ error: "User is not an Urban Planner", status: 401 });
}

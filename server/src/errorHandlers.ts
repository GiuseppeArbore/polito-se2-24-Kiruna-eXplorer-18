import { Request, Response, NextFunction, Application } from 'express';
import { validationResult } from 'express-validator';



export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    } else {
        next();
    }
};

export function registerErrorHandler(app: Application) {
    app.use((err: any, req: any, res: any, next: any) => {
        return res.status(err.customCode || 400).json({
            error: err.customMessage || "Internal Server Error",
            status: err.customCode || 400
        });
    })
}

import { createKxDocument, getAllKxDocuments, getKxDocumentById, deleteKxDocument, getPresignedUrlForAttachment, updateKxDocumentInfo, updateKxDocumentDescription, handleFileUpload, removeAttachmentFromDocument, getKxDocumentAggregateData } from './controller';
import { validateRequest } from './errorHandlers';
import e, { Application, NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { AreaType, KxDocumentType, Stakeholders } from './models/enum';
import { coordDistance, isDocCoords, isScale, KIRUNA_COORDS } from './utils';
import multer from 'multer';
import * as mime from 'mime-types';
import { randomBytes } from 'crypto';
import { mkdir } from 'fs/promises';
import { isUrbanPlanner } from './auth';
import kirunaPolygon from './KirunaMunicipality.json';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { Feature, Polygon, MultiPolygon } from "geojson";

export function initRoutes(app: Application) {

    const kxDocumentValidationChain = [
        body('title').notEmpty().withMessage('Title is required'),
        body('stakeholders').notEmpty().withMessage('Stakeholders are required')
            .isArray().withMessage('Stakeholders must be an array'),
        body('stakeholders.*').isString().withMessage('Stakeholders must be an array of strings'),
        body('scale').notEmpty().withMessage('Scale is required')
            .isObject().custom((v) => {
                return isScale(v);
            }).withMessage('Invalid scale'),
        body('issuance_date').notEmpty().withMessage('Issuance date is required')
            .isObject().withMessage("Issuance date not valid"),
        body('issuance_date.from').notEmpty().isISO8601().toDate().withMessage('Issuance date must be a valid date'),
        body('issuance_date.to').optional().isISO8601().toDate().withMessage('Issuance date must be a valid date'),
        body('type').notEmpty().withMessage('Type is required')
            .isString().withMessage("Type must be a string"),
        body('language').optional().notEmpty().withMessage('Language is required')
            .isString().withMessage('Language must be a string'),
        body('doc_coordinates').notEmpty().withMessage('Document coordinates are required').isObject()
            .custom((v) => {
                const poly = kirunaPolygon.features[0] as Feature<Polygon | MultiPolygon>;
                return isDocCoords(v) &&
                    (
                        (v.type === AreaType.ENTIRE_MUNICIPALITY) ||
                        (v.type === AreaType.POINT && booleanPointInPolygon([v.coordinates[0], v.coordinates[1]], poly)) ||
                        (v.type === AreaType.AREA && v.coordinates.every(c => c.every(c => booleanPointInPolygon([c[0], c[1]], poly))))
                    )
            }).withMessage('Invalid document coordinates'),
        body('description').notEmpty().withMessage('Description is required'),
        body('pages').optional().isArray().custom((v) => {
            if (!Array.isArray(v))
                return false;

            return v.every((e) => {
                return ((Array.isArray(e) && e.length === 2 && e.every(t => typeof t === "number" && t >= 0 && Number.isInteger(t))) ||
                    (typeof e === "number" && e >= 0 && Number.isInteger(e)));
            })
        }).withMessage('Invalid pages'),
        body('connections').optional().isObject().custom((v) => {
            if (typeof v !== 'object' || v === null) return false;
            const lists = Object.values(v);
            const allItems = lists.flat();
            const uniqueItems = new Set(allItems);
            return uniqueItems.size === allItems.length;
        }).withMessage('Invalid connections'),
    ];

    const storage = multer.diskStorage({
        destination: async (req, _file, cb) => {
            const dir = `tmp/${req.params.id}`;
            await mkdir(dir, { recursive: true });
            cb(null, dir);
        },
        filename: async (_req, file, cb) => {
            const ext = file.mimetype ? mime.extension(file.mimetype) : file.originalname.split(".").pop() || false;
            const hexBytes = randomBytes(16).toString("hex");
            const fileName = `${hexBytes}.${ext || "bin"}`;
            cb(null, fileName);
        }
    });

    const upload = multer({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MiB
        }
    });

    app.get("/doc", async (_, res) => {
        res.status(200).json({ ok: "ok" });
    });

    app.post(
        '/api/documents',
        isUrbanPlanner,
        kxDocumentValidationChain,
        validateRequest,
        createKxDocument
    );

    app.post(
        '/api/documents/:id/attachments',
        isUrbanPlanner,
        [
            param("id").notEmpty().withMessage("Missing id").isString().isHexadecimal().withMessage("Invalid id")
        ],
        validateRequest,
        upload.array("attachments", 10),
        handleFileUpload
    );

    app.delete(
        '/api/documents/:id/attachments/:fileName',
        isUrbanPlanner,
        [
            param("id").notEmpty().withMessage("Missing id").isString().isHexadecimal().withMessage("Invalid id"),
            param("fileName").notEmpty().withMessage("Missing file name").isString().withMessage("Invalid file name")
        ],
        validateRequest,
        removeAttachmentFromDocument
    );

    app.get('/api/documents', getAllKxDocuments);

    app.get(
        '/api/documents/aggregateData',
        // This is a potentially onerous operation, so we only allow it for authenticated
        // users (non authenticated users do not need to call this anyway)
        isUrbanPlanner,
        getKxDocumentAggregateData
    );

    app.get('/api/documents/:id',
        [
            param("id").notEmpty().withMessage("id is required"),
        ],
        validateRequest,
        getKxDocumentById,
    );

    app.get('/api/documents/:id/presignedUrl/:fileName',
        [
            param("id").notEmpty().withMessage("id is required"),
            param("fileName").notEmpty().withMessage("fileName is required").custom((f) => {
                if (typeof f !== "string") return false;
                const codepoints = [...f];
                if (codepoints.length > 1024 ||
                    // Only allow characters accepted by Backblaze https://www.backblaze.com/docs/cloud-storage-files#file-names
                    codepoints.find((c) => {
                        const charCode = c.charCodeAt(0);
                        return charCode < 32 ||
                            charCode === 127 ||
                            c === "/" ||
                            c === "\\";
                    })
                ) return false;

                return true;
            })
        ],
        validateRequest,
        getPresignedUrlForAttachment
    );

    app.delete('/api/documents/:id',
        isUrbanPlanner,
        deleteKxDocument
    );

    app.put('/api/documents/:id/description',
        isUrbanPlanner,
        [
            param("id").notEmpty().withMessage("id is required"),
            body("description").notEmpty().withMessage("description is required"),
        ],
        validateRequest,
        updateKxDocumentDescription
    );

    app.put('/api/documents/:id/info',
        isUrbanPlanner,
        [
            param("id").notEmpty().withMessage("id is required"),
            body("title").optional(),
            body("stakeholders").optional(),
            body("scale").optional(),
            body("type").optional(),
            body("language").optional(),
            body("pages").optional(),
            body("docCoordinates").optional(),
        ],
        validateRequest,
        updateKxDocumentInfo
    )
}

export default initRoutes;
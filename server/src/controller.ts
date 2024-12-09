import { Request, Response, NextFunction } from 'express';
import { db } from './db/dao';
import { KxDocumentModel, KxDocument, DocInfo, KxDocumentAggregateData } from './models/model';
import { mongoose } from '@typegoose/typegoose';
import { getPresignedUrl, kxObjectStorageClient, KxObjectStorageCommands } from './object_storage/bucket';
import { PutObjectCommandOutput, S3ServiceException } from '@aws-sdk/client-s3';
import { rm } from 'fs/promises';
import { setTimeout } from 'timers/promises';
import { KxDocumentType, Stakeholders } from './models/enum';

export const createKxDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const document = await KxDocumentModel.create(req.body);
        //const document = req.body as KxDocument;
        const createdDocument = await db.createKxDocument(document);

        if (createdDocument) {
            res.status(201).json(createdDocument);
        }

    } catch (error) {
        next(error);
    }
};

export const getAllKxDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const documents: KxDocument[] = await db.getAlldocuments();
        res.status(200).json(documents);
    } catch (error) {
        next(error);
    }
};

export const getKxDocumentAggregateData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const defaultAggregate: KxDocumentAggregateData = {
            stakeholders: Object.values(Stakeholders),
            types: Object.values(KxDocumentType),
            scales: [10_000]
        };

        const aggregate = await db.getKxDocumentsAggregateData() || defaultAggregate;
        if (aggregate.stakeholders.length < defaultAggregate.stakeholders.length) {
            aggregate.stakeholders = [
                ...new Set([...aggregate.stakeholders, ...defaultAggregate.stakeholders])
            ];
        }
        if (aggregate.types.length < defaultAggregate.types.length) {
            aggregate.types = [
                ...new Set([...aggregate.types, ...defaultAggregate.types])
            ];
        }
        if (aggregate.scales.length < defaultAggregate.scales.length) {
            aggregate.scales = [
                ...new Set([...aggregate.scales, ...defaultAggregate.scales])
            ];
        }

        res.status(200).json(aggregate);
    } catch (error) {
        next(error);
    }
}

export const getKxDocumentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const document: KxDocument | null = await db.getKxDocumentById(new mongoose.Types.ObjectId(req.params.id));
        if (document) {
            res.status(200).json(document);
        } else {
            console.log("Document not found");
            res.status(404).send();
        }
    } catch (error) {
        console.log("Error in getKxDocumentById");
        next(error);
    }
};
export const deleteKxDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const isDeleted = await db.deleteKxDocument(id);
        if (isDeleted) {
            res.status(204).send();
        } else {
            res.status(404).json("Document not found");
        }
    } catch (error) {
        next(error);
    }
}

export const getPresignedUrlForAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const fileName = req.params.fileName;
        const url = await getPresignedUrl(id, fileName);

        res.status(201).json({ presignedUrl: url });

    } catch (error) {
        next(error);
    }
}

export const handleFileUpload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    interface JobResult {
        fileName: string,
        S3Output: PutObjectCommandOutput
    }

    const docId = new mongoose.Types.ObjectId(req.params.id);
    if (!req.files) {
        res.status(409).send();
        return;
    }
    if (!await db.getKxDocumentById(docId)) {
        res.status(404).send();
        return;
    }

    // Immediately send a response to avoid blocking the client
    res.status(201).send();
    const allFiles = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    let toUpload = allFiles.map(f => f.filename);

    let retryDelayMs = 10_000;
    const maxDelayBeforeFailure = 1000 * 60 * 60 * 24;
    while (toUpload.length !== 0) {
        const uploadJobs = toUpload.map(async (fn) => {
            const out = await kxObjectStorageClient.send(KxObjectStorageCommands.uploadAttachmentForDocument(
                docId,
                fn
            ));
            return {
                fileName: fn,
                S3Output: out
            } as JobResult;
        });

        const uploadResult = await Promise.allSettled(uploadJobs);
        const failed = uploadResult.filter(r => r.status === "rejected");
        const succeded = uploadResult.filter(r => r.status === "fulfilled").map(r => r.value.fileName);
        toUpload = toUpload.filter(f => !succeded.includes(f));

        const dbUpdate = await db.addKxDocumentAttachments(docId, succeded);
        if (!dbUpdate)
            throw Error("Cannot write to db");

        const fileRemoveJobs = succeded.map(f => rm(`tmp/${req.params.id}/${f}`));
        await Promise.allSettled(fileRemoveJobs);

        if (toUpload.length !== 0) {
            console.log(failed);
            if (retryDelayMs > maxDelayBeforeFailure) {
                console.error(`Document ${req.params.id}: Failed to upload some files to object storage (${toUpload.join(", ")})`);
                break;
            }
            console.log(`Retrying upload in ${retryDelayMs / 1000}s`);
            await setTimeout(retryDelayMs);
            retryDelayMs *= 2;
        }
    }
}

export const removeAttachmentFromDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const fileName = req.params.fileName;
    const dbUpdate = await db.removeKxDocumentAttachments(id, [fileName]);
    if (!dbUpdate) {
        res.status(404).send({ error: "The file does not exist" });
        return;
    }
    // Immediately send a response to avoid blocking the client
    res.status(200).send();

    await kxObjectStorageClient.send(KxObjectStorageCommands.deleteAttachmentForDocument(id, fileName));
}

export const updateKxDocumentDescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const description = req.body.description;
        const updatedDocument = await db.updateKxDocumentDescription(id, description);
        if (updatedDocument) {
            res.status(200).json(updatedDocument);
        } else {
            res.status(404).json("Document not found");
        }
    } catch (error) {
        next(error);
    }
}

export const updateKxDocumentInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = new mongoose.Types.ObjectId(req.params.id);
        const info = req.body as DocInfo;
        const updatedDocument = await db.updateKxDocumentInfo(id, info);
        if (updatedDocument) {
            res.status(200).json(updatedDocument);
        } else {
            res.status(404).json("Document not found");
        }
    } catch (error) {
        next(error);
    }
}
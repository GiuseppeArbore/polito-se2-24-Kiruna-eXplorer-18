import { Request, Response, NextFunction } from 'express';
import { db } from './db/dao';
import { KxDocumentModel, KxDocument } from './models/model';
import { mongoose } from '@typegoose/typegoose';
import { getPresignedUrl } from './object_storage/bucket';

export const createKxDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const document = await KxDocumentModel.create(req.body);
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

        res.status(201).json({presignedUrl: url});
        
    } catch (error) {
        next(error);
    }
}

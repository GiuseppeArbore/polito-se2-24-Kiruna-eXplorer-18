import { DocInfo, KxDocument, KxDocumentAggregateData } from "../models/model";
import { KxDocumentModel } from "../models/model";
import { mongoose } from "@typegoose/typegoose";
import dotenv from 'dotenv';
import { User, UserModel } from "../models/user";


class DAO {
    private static instance: DAO;
    private constructor() {
        const str = process.env.MONGO_CONN_STR;
        console.log('conn_string', str);
        this.connectToDB(str);
    }

    static getInstance(): DAO {
        if (!DAO.instance) {

            DAO.instance = new DAO();
        }
        return DAO.instance;
    }

    private async connectToDB(conn_string: string | undefined) {
        let conn: string = "mongodb://localhost:27017/kiruna-ex";
        if (conn_string) {
            conn = conn_string;
        }
        try {
            await mongoose.connect(conn, {
                autoCreate: true,
            });
        } catch (error) {
            console.error('Error connecting to the database', error);
        }
    }
    async disconnectFromDB() {
        try {
            await mongoose.disconnect();
        } catch (error) {
            console.error('Error disconnecting from the database', error);
        }
    }
    async getUserByEmail(email: string): Promise<User | null> {
        const res = await UserModel.findOne().where("email").equals(email).exec();
        return this.fromResultToUser(res);
    }
    async deleteUser(id: mongoose.Types.ObjectId): Promise<boolean> {
        const result = await UserModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 1) {
            return true;
        }
        return false;
    }
    async getKxDocumentById(id: mongoose.Types.ObjectId): Promise<KxDocument | null> {
        const result = await KxDocumentModel.find().where("_id").equals(id).exec();
        if (result.length > 0) {
            return this.fromResultToKxDocument(result[0]);
        }
        return null;
    }
    async getKxDocumentByTitle(title: string): Promise<KxDocument | null> {
        const result = await KxDocumentModel.find().where("title").equals(title).exec();
        if (result.length > 0) {
            return this.fromResultToKxDocument(result[0]);
        }
        return null;
    }
    async getKxDocumentsAggregateData(): Promise<KxDocumentAggregateData | null> {
        const result = await KxDocumentModel.aggregate([
            {
                $project: {
                    _id: 0,
                    stakeholders: 1,
                    type: 1,
                    scale: 1
                }
            },
            {
                $unwind: {
                    path: "$stakeholders"
                }
            },
            {
                $group: {
                    _id: null,
                    stakeholders: {
                        $addToSet: "$stakeholders"
                    },
                    types: {
                        $addToSet: "$type"
                    },
                    scales: {
                        $addToSet: "$scale"
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]).exec();
        if (result.length > 0) {
            return this.fromResultToAggregate(result[0]);
        }
        return null;
    }
    async getAlldocuments(): Promise<KxDocument[]> {
        const result = await KxDocumentModel.find().sort({ title: 1 }).exec();
        if (result.length > 0) {
            const list = result.map((doc: any) => {
                return this.fromResultToKxDocument(doc);
            });
            return list;
        }
        return [];
    }
    async createKxDocument(document: KxDocument): Promise<KxDocument | null> {
        const newDocument = new KxDocumentModel(document);
        const result = await newDocument.save();
        if (result) {
            return this.fromResultToKxDocument(result);
        }
        return null;
    }
    async deleteKxDocument(id: mongoose.Types.ObjectId): Promise<Boolean> {
        const result = await KxDocumentModel.deleteOne({
            _id: id
        }).exec();
        if (result.deletedCount === 1) {
            return true;

        }
        return false;
    }
    async addKxDocumentAttachments(id: mongoose.Types.ObjectId, fileNames: string[]): Promise<boolean> {
        const result = await KxDocumentModel.updateOne(
            { _id: id._id },
            {
                $push: {
                    attachments: {
                        $each: fileNames
                    }
                }
            }
        ).exec();

        if (result.modifiedCount === 0)
            return false;
        return true;
    }
    async removeKxDocumentAttachments(id: mongoose.Types.ObjectId, fileNames: string[]): Promise<boolean> {
        const result = await KxDocumentModel.updateOne(
            { _id: id._id },
            {
                $pull: {
                    attachments: {
                        $in: fileNames
                    }
                }
            }
        ).exec();

        if (result.modifiedCount === 0)
            return false;
        return true;
    }
    async updateKxDocumentDescription(id: mongoose.Types.ObjectId, description: string): Promise<KxDocument | null> {
        const result = await KxDocumentModel.updateOne(
            { _id: id._id },
            {
                $set: {
                    description: description
                }
            }
        ).exec();

        if (result.modifiedCount === 0)
            return null;

        return await this.getKxDocumentById(id);
    }
    async updateKxDocumentInfo(id: mongoose.Types.ObjectId, info: DocInfo): Promise<KxDocument | null> {
        const result = await KxDocumentModel.updateOne(
            { _id: id._id },
            {
                $set: info
            }
        ).exec();

        if (result.modifiedCount === 0)
            return null;

        return await this.getKxDocumentById(id);
    }
    private fromResultToAggregate(result: any): KxDocumentAggregateData | null {
        try {
            return {
                stakeholders: result.stakeholders,
                types: result.types,
                scales: result.scales,
            }
        } catch {
            return null;
        }
    }
    private fromResultToUser(result: any | null): User | null {
        return result && {
            _id: result._id,
            email: result.email,
            password: result.password,
            salt: result.salt,
            role: result.role
        }
    }
    private fromResultToKxDocument(result: any): KxDocument {
        return {
            title: result.title,
            _id: result._id,
            stakeholders: result.stakeholders,
            scale: result.scale,
            scale_info: result.scale_info,
            issuance_date: result.issuance_date,
            type: result.type,
            connections: result.connections,
            pages: result.pages,
            doc_coordinates: result.doc_coordinates,
            description: result.description,
            language: result.language,
            attachments: result.attachments
        } as KxDocument;
    }
}



export const db = DAO.getInstance();


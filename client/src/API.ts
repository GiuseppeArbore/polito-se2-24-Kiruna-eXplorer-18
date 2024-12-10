import { mongoose } from '@typegoose/typegoose';
import { KxDocument, PageRange } from './model';

const API_URL =  import.meta.env.VITE_SERVER_ENV as string;

const createKxDocument = async (document: KxDocument): Promise<KxDocument | null> => {
    try {
        const response = await fetch(API_URL + "/documents", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(document),
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const data: KxDocument = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create document: ${error.message}`);
        } else {
            throw new Error('Failed to create document: Unknown error');
        }
    }
};
const getAllKxDocuments = async (): Promise<KxDocument[]> => {
    try {
        const response = await fetch(API_URL + "/documents", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const data: KxDocument[] = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch documents: ${error.message}`);
        } else {
            throw new Error('Failed to fetch documents: Unknown error');
        }
    }
};

// function to update title, stakeholders, type, scale, language, pages
const updateKxDocumentInformation = async (
    documentId: string,
    title?: string,
    stakeholders?: string[],
    type?: string,
    scale?: number,
    language?: string,
    pages?: PageRange[],
    doc_coordinates?: any
): Promise<KxDocument | null> => {
    try {
        const body: any = {};
        if (title !== undefined) body.title = title;
        if (stakeholders !== undefined) body.stakeholders = stakeholders;
        if (type !== undefined) body.type = type;
        if (scale !== undefined) body.scale = scale;
        if (language !== undefined) body.language = language;
        if (pages !== undefined) body.pages = pages;
        if (doc_coordinates !== undefined) body.doc_coordinates = doc_coordinates;

        const response = await fetch(API_URL + `/documents/${documentId}/info`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                credentials: 'include'
            },
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const data: KxDocument = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update document: ${error.message}`);
        } else {
            throw new Error('Failed to update document: Unknown error');
        }
    }
};

const updateKxDocumentDescription = async (documentId: string, description: string): Promise<KxDocument | null> => {
    try {
        const response = await fetch(API_URL + `/documents/${documentId}/description`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ description }),
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const data: KxDocument = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to update document: ${error.message}`);
        } else {
            throw new Error('Failed to update document: Unknown error');
        }
    }
};
const getKxFileByID = async (id: mongoose.Types.ObjectId, fileName: string): Promise<{ presignedUrl: string }> => {
    try {
        const response = await fetch(API_URL + `/documents/${id}/presignedUrl/${fileName}`, {
            method: 'GET',

        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }
        const data: { presignedUrl: string } = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch document: ${error.message}`);
        } else {
            throw new Error('Failed to fetch document: Unknown error');
        }
    }
};

const getKxDocumentById = async (id: mongoose.Types.ObjectId): Promise<KxDocument> => {
    try {
        const response = await fetch(API_URL + `/documents/${id}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const data: KxDocument = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch document: ${error.message}`);
        } else {
            throw new Error('Failed to fetch document: Unknown error');
        }
    }
};

const deleteKxDocument = async (id: mongoose.Types.ObjectId): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete document: ${error.message}`);
        } else {
            throw new Error('Failed to delete document: Unknown error');



        }
    }
};

const addAttachmentToDocument = async (id: mongoose.Types.ObjectId, files: File[]): Promise<Boolean> => {
    try {
        const formData = new FormData();
        files.forEach(file => formData.append('attachments', file, file.name));
        const response = await fetch(`${API_URL}/documents/${id}/attachments`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }
        return true;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to add attachment: ${error.message}`);
        } else {
            throw new Error('Failed to add attachment: Unknown error');
        }
    }
};

const deleteAttachmentFromDocument = async (id: mongoose.Types.ObjectId, fileName: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/documents/${id}/attachments/${fileName}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete attachment: ${error.message}`);
        } else {
            throw new Error('Failed to delete attachment: Unknown error');
        }
    }
}


interface Credentials {
    username: string;
    password: string;
}

const login = async (credentials: Credentials) => {
    const response = await fetch(API_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetails = await response.json();
        throw errDetails;
    }
};

const getUserInfo = async () => {
    const response = await fetch(API_URL + '/sessions/current', {
        method: 'GET',
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        return response.json();
    }
};

const logout = async () => {
    const response = await fetch(API_URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        return null;
    }
};

const API = { createKxDocument, getAllKxDocuments, getKxDocumentById, deleteKxDocument, updateKxDocumentDescription, updateKxDocumentInformation, getKxFileByID, addAttachmentToDocument, deleteAttachmentFromDocument, login, getUserInfo, logout };
export default API;
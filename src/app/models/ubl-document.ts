import { User } from 'ngo-login-client';

export interface UBLDocument {
    id: string;
    type: string;
    attributes: UBLDocumentAttributes;
    links: UBLDocumentLink;
    relationships: UBLDocumentRelationships;

    path: string;
    assignedId: string;
    relationalData?: UBLDocumentRelationalData;
}

export class UBLDocumentLink {
    self: string;
    filters?: string;
}

export class UBLDocumentRelationships {
    supplier: any;
    customer: any;
    'owned-by': {
        data: {
            id: string;
            type: string;
        };
    };
}

export class UBLDocumentAttributes {
    id: string;
    assignedId: string;
    documentType: string;
    tags: any;
    'updated-at': string;
    'created-at': string;
}

export class UBLDocumentRelationalData {
    creator?: User;
}

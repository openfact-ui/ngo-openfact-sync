import { Space } from './space';

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
    filelink: string;
    filters?: string;
}

export class UBLDocumentRelationships {
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
    type: string;
    currency: string;
    amount: number;
    issueDate: Date;
    supplierName: string;
    supplierAssignedId: string;
    customerName: string;
    customerAssignedId: string;
    provider: string;
    starred: boolean; //
    tags: string[];
    'updated-at': string;
    'created-at': string;
}

export class UBLDocumentRelationalData {
    creator?: Space;
}

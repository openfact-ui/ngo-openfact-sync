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
    stared: boolean;
    tags: string[];
    'updated-at': string;
    'created-at': string;
}

export class UBLDocumentRelationalData {
    creator?: Space;
}

import { UBLDocument } from './../models/ubl-document';
import { Team } from './../models/team';
import { Space } from './../models/space';
import { User } from 'ngo-login-client';
import { ContextType } from './context-type';

export interface Context {
    // The entity that this context is for
    user: User;
    space?: Space;
    document?: UBLDocument;
    team?: Team;
    type: ContextType;
    path: string;
    name: string;
}

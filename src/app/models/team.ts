import { User } from 'ngo-login-client';

export interface Team {
    name: string;
    members: User[];
}

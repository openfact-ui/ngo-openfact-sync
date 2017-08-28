import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams, Response } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService, User } from 'ngo-login-client';
import { Logger } from 'ngo-base';
import { Observable } from 'rxjs';

import { SYNC_API_URL } from '../api/sync-api';

@Injectable()
export class CollaboratorService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesUrl: string;
  private nextLink: string;

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService,
    @Inject(SYNC_API_URL) apiUrl: string) {
    if (this.auth.getAccessToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getAccessToken());
    }
    this.spacesUrl = apiUrl + 'spaces';
  }

  getInitialBySpaceId(spaceId: string, pageSize: number = 20): Observable<User[]> {
    let url = this.spacesUrl + '/' + spaceId + '/collaborators' + '?page[limit]=' + pageSize;
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {

        let links = response.json().links;
        if (links.hasOwnProperty('next')) {
          this.nextLink = links.next;
        } else {
          this.nextLink = null;
        }

        let collaborators: User[] = response.json().data as User[];
        return collaborators;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  getNextCollaborators(): Observable<User[]> {
    if (this.nextLink) {
      return this.http
        .get(this.nextLink, { headers: this.headers })
        .map(response => {
          let links = response.json().links;
          if (links.hasOwnProperty('next')) {
            this.nextLink = links.next;
          } else {
            this.nextLink = null;
          }

          let collaborators: User[] = response.json().data as User[];
          return collaborators;
        })
        .catch((error) => {
          return this.handleError(error);
        });
    } else {
      return Observable.throw('No more collaborators found');
    }
  }

  addCollaborators(spaceId: string, users: User[]): Observable<Response> {
    let url = this.spacesUrl + '/' + spaceId + '/collaborators';
    let payload = JSON.stringify({ data: users });
    return this.http
      .post(url, payload, { headers: this.headers })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  removeCollaborator(spaceId: string, collaboratorId: string): Observable<void> {
    let url = this.spacesUrl + '/' + spaceId + '/collaborators/' + collaboratorId;
    return this.http
      .delete(url, { headers: this.headers })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

}

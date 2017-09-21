import { Space } from './../models/space';
import { SpaceService } from './../spaces/space.service';
import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService } from 'ngo-login-client';
import { Logger } from 'ngo-base';
import { Observable } from 'rxjs';

import { SYNC_API_URL } from '../api/sync-api';
import { UBLDocument } from '../models/ubl-document';

@Injectable()
export class UBLDocumentService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private documentsUrl: string;
  private namedDocumentsUrl: string;
  private searchDocumentsUrl: string;
  private nextLink: string = null;

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService,
    private spaceService: SpaceService,
    @Inject(SYNC_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.documentsUrl = apiUrl + 'documents';
    this.namedDocumentsUrl = apiUrl + 'nameddocuments';
    this.searchDocumentsUrl = apiUrl + 'search/documents';
  }

  /**
   * Get All documents
   */
  getDocuments(pageSize: number = 20): Observable<UBLDocument[]> {
    let url = this.documentsUrl + '?page[limit]=' + pageSize;
    return this.getDocumentsDelegate(url, true);
  }

  /**
   * Get More documents
   */
  getMoreDocuments(): Observable<UBLDocument[]> {
    if (this.nextLink) {
      return this.getDocumentsDelegate(this.nextLink, false);
    } else {
      return Observable.throw('No more documents found');
    }
  }

  /**
   * Currently returns the document emited by space
   * @param spaceAssignedId
   * @param documentAssignedId
   */
  getDocumentByAssignedId(spaceAssignedId: string, documentAssignedId: string): Observable<UBLDocument> {
    let url = `${this.namedDocumentsUrl}/${spaceAssignedId}/${documentAssignedId}`;
    return this.http.get(url, { headers: this.headers })
      .map((response) => {
        return response.json().data as UBLDocument;
      })
      .switchMap(val => this.resolveOwner(val))
      .catch((error) => {
        return this.handleError(error);
      });
  }

  getDocumentsDelegate(url: string, isAll: boolean): Observable<UBLDocument[]> {
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {
        // Extract links from JSON API response.
        // and set the nextLink, if server indicates more resources
        // in paginated collection through a 'next' link.
        let links = response.json().links;
        if (links.hasOwnProperty('next')) {
          this.nextLink = links.next;
        } else {
          this.nextLink = null;
        }
        // Extract data from JSON API response, and assert to an array of documents.
        let newDocuments: UBLDocument[] = response.json().data as UBLDocument[];
        return newDocuments;
      })
      .switchMap(documents => {
        return this.resolveOwners(documents);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * 
   */
  create(document: UBLDocument): Observable<UBLDocument> {
    let url = this.documentsUrl;
    let payload = JSON.stringify({ data: document });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as UBLDocument;
      })
      .switchMap(val => {
        return this.resolveOwner(val);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Update UBLDocument
   */
  update(document: UBLDocument): Observable<UBLDocument> {
    let url = `${this.documentsUrl}/${document.id}`;
    let payload = JSON.stringify({ data: document });
    return this.http
      .patch(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as UBLDocument;
      })
      .switchMap(val => {
        return this.resolveOwner(val);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Delete document using id
   */
  deleteDocument(document: UBLDocument): Observable<UBLDocument> {
    let url = `${this.documentsUrl}/${document.id}`;
    return this.http
      .delete(url, { headers: this.headers })
      .map(() => { })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Filter documents. If empty then searchText becomes '*'
   */
  search(searchText: string): Observable<UBLDocument[]> {
    let url = this.searchDocumentsUrl;
    let params: URLSearchParams = new URLSearchParams();
    if (searchText === '') {
      searchText = '*';
    }
    params.set('q', searchText);

    return this.http
      .get(url, { search: params, headers: this.headers })
      .map(response => {
        // Extract data from JSON API response, and assert to an array of documents.
        return response.json().data as UBLDocument[];
      })
      .switchMap(documents => {
        return this.resolveOwners(documents);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Currently serves to fetch the list of all documents owned by a user.
   * @param userName
   * @param pageSize
   */
  getDocumentsByUser(userName: string, pageSize: number = 20): Observable<UBLDocument[]> {
    let url = `${this.namedDocumentsUrl}/${userName}` + '?page[limit]=' + pageSize;
    let isAll = false;
    return this.getDocumentsDelegate(url, isAll);
  }

  getMoreDocumentsByUser(): Observable<UBLDocument[]> {
    if (this.nextLink) {
      return this.getDocumentsDelegate(this.nextLink, false);
    } else {
      return Observable.throw('No more documents found');
    }
  }

  /**
   * Get document by id
   */
  getDocumentById(documentId: string): Observable<UBLDocument> {
    let url = `${this.documentsUrl}/${documentId}`;
    return this.http.get(url, { headers: this.headers })
      .map((response) => {
        return response.json().data as UBLDocument;
      })
      .switchMap(val => this.resolveOwner(val))
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

  private resolveOwner(document: UBLDocument): Observable<UBLDocument> {
    document.relationalData = document.relationalData || {};

    if (!document.relationships['owned-by'] || !document.relationships['owned-by'].data) {
      document.relationalData.creator = null;
      return;
    }
    return this.spaceService
      .getSpaceById(document.relationships['owned-by'].data.id)
      .map(owner => {
        document.relationalData.creator = owner;
        return document;
      });
  }

  private resolveOwners(documents: UBLDocument[]): Observable<UBLDocument[]> {
    return Observable
      // Get a stream of documents
      .from(documents)
      // Map to a stream of owner Ids of these documents
      .map(document => document.relationships['owned-by'].data.id)
      // Get only the unique owners in this stream of owner Ids
      .distinct()
      // Get the spaces from the server based on the owner Ids
      // and flatten the resulting stream , observables are returned
      .flatMap(ownerId => this.spaceService.getSpaceById(ownerId).catch(err => {
        console.log('Error fetching space', ownerId, err);
        return Observable.empty<Space>();
      }))
      // map the space objects back to the documents to return a stream of documents
      .map(owner => {
        if (owner) {
          for (let document of documents) {
            document.relationalData = document.relationalData || {};
            if (owner.id === document.relationships['owned-by'].data.id) {
              document.relationalData.creator = owner;
            }
          }
        }
        return documents;
      });
  }

}

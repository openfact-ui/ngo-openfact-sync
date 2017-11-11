import { SearchResult } from './../models/search-result';
import { Space } from './../models/space';
import { SpaceService } from './../spaces/space.service';
import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams, RequestOptions, ResponseContentType } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService } from 'ngo-login-client';
import { Logger } from 'ngo-base';
import { Observable } from 'rxjs';

import { SYNC_API_URL } from '../api/sync-api';
import { UBLDocument } from '../models/ubl-document';
import { FileWrapper } from './../models/file-wrapper';

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
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Update UBLDocument
   */
  updateMassive(documents: UBLDocument[]): Observable<UBLDocument> {
    let url = `${this.documentsUrl}/massive`;
    let payload = JSON.stringify({ data: documents });
    return this.http
      .patch(url, payload, { headers: this.headers })
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
  search(searchText: string): Observable<SearchResult<UBLDocument>> {
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
        let json = response.json();
        return {
          totalResults: json.meta.totalCount,
          data: json.data as UBLDocument[]
        } as SearchResult<UBLDocument>;
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
      .catch((error) => {
        return this.handleError(error);
      });
  }

  downloadDocumentById(documentId: string): Observable<FileWrapper> {
    let url = `${this.documentsUrl}/${documentId}/download`;
    return this.http.get(url, {
      headers: this.headers,
      responseType: ResponseContentType.Blob
    })
      .map((response) => {
        let filename;
        let headers = response.headers;
        let disposition = headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        let file = response.blob();
        let blob = new Blob([file]);
        return {
          filename: filename,
          file: blob
        } as FileWrapper;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  printDocumentById(documentId: string, theme?: string, format?: string): Observable<FileWrapper> {
    let params = new URLSearchParams();
    if (theme) params.append('theme', theme);
    if (format) params.append('format', format);

    let url = `${this.documentsUrl}/${documentId}/print`;
    return this.http.get(url, {
      headers: this.headers,
      responseType: ResponseContentType.Blob,
      params: params
    })
      .map((response) => {
        let filename;
        let headers = response.headers;
        let disposition = headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        let file = response.blob();
        let blob = new Blob([file]);

        return {
          filename: filename,
          file: blob
        } as FileWrapper;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  downloadDocumentsMassive(documents: string[]): Observable<FileWrapper> {
    let params = new URLSearchParams();
    documents.forEach(d => params.append('documents', d));

    let url = `${this.documentsUrl}/massive/download`;
    return this.http.get(url, {
      headers: this.headers,
      responseType: ResponseContentType.Blob,
      params: params
    })
      .map((response) => {
        let filename;
        let headers = response.headers;
        let disposition = headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        let file = response.blob();
        let blob = new Blob([file]);
        return {
          filename: filename,
          file: blob
        } as FileWrapper;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  printDocumentsMassive(documents: string[], theme?: string, format?: string): Observable<FileWrapper> {
    let params = new URLSearchParams();
    documents.forEach(d => params.append('documents', d));
    if (theme) params.append('theme', theme);
    if (format) params.append('format', format);

    let url = `${this.documentsUrl}/massive/print`;
    return this.http.get(url, {
      headers: this.headers,
      responseType: ResponseContentType.Blob,
      params: params
    })
      .map((response) => {
        let filename;
        let headers = response.headers;
        let disposition = headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        let file = response.blob();
        let blob = new Blob([file]);

        return {
          filename: filename,
          file: blob
        } as FileWrapper;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

}

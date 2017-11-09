import { Mail } from './../models/mail';
import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams, RequestOptions, ResponseContentType, Response } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService } from 'ngo-login-client';
import { Logger } from 'ngo-base';
import { Observable } from 'rxjs';

import { SYNC_API_URL } from '../api/sync-api';

@Injectable()
export class MailService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private mailUrl: string;

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService
    @Inject(SYNC_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.mailUrl = apiUrl + 'mail';
  }

  sendMail(mail: Mail): Observable<Response> {
    let url = this.mailUrl;
    let payload = JSON.stringify({ data: mail });
    return this.http
      .post(url, payload, { headers: this.headers })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

}

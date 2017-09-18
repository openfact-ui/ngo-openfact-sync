import { UBLDocument } from './../models/ubl-document';
import { Observable } from 'rxjs';

export class UBLDocuments {

  /**
   * An observable which pushes changes to the current document.
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  current: Observable<UBLDocument>;

  /**
   * An observable which pushes changes to the array of recent documents.
   * It is backed by a multicasted replay subject so you will always received
   * the latest value, regardless of when you subscribe.
   */
  recent: Observable<UBLDocument[]>;
}

export class UBLDocumentQuery {
  filterText?: string; // if null then * is set
  spacePosition?: string; // sender, receiver
  currency?: string; // usd, pen, etc.
  documentType?: string; // invoice, creditNote, DebitNote
  after?: Date;
  before?: Date;
  greater?: number; // amount greather than
  less?: number; // amount less than
  tags?: string[];
  spaces?: string[]; // spaces ids
}

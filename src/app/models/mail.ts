export interface Mail {
  id: string;
  type: string;
  attributes: MailAttributes;
}

export class MailAttributes {
  id: string;
  subject: string;
  message: string;
  documents: string[];
  recipients: string[];
}

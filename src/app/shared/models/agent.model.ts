import { Language } from './language.model';

export class Agent {
  labsId: string;
  name: string;
  photoUrl: string;
  language: Language;

  constructor(
    labsId: string,
    name: string,
    photoUrl: string,
    language: Language
  ) {
    this.labsId = labsId;
    this.name = name;
    this.photoUrl = photoUrl;
    this.language = language;
  }
}

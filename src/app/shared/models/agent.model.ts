export class Agent {
  labsId: string;
  name: string;
  photoUrl: string;
  language: string;

  constructor(
    labsId: string,
    name: string,
    photoUrl: string,
    language: string
  ) {
    this.labsId = labsId;
    this.name = name;
    this.photoUrl = photoUrl;
    this.language = language;
  }
}

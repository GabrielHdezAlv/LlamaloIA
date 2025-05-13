export class Agent {
  labsId: string;
  name: string;
  photoUrl: string;

  constructor(labsId: string, name: string, photoUrl: string) {
    this.labsId = labsId;
    this.name = name;
    this.photoUrl = photoUrl;
  }
}

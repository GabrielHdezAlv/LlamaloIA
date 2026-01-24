export class User {
  userId?: string;
  name: string;
  lastname: string;
  profileImage?: string;
  enterprise?: string;
  enterpriseWeb?: string;
  country?: string;
  email: string;
  password: string;
  token?: string;
  voiceId?: string;
  language?: any;

  constructor(
    name: string,
    lastname: string,
    email: string,
    password: string,
    userId: string,
    profileImage?: string,
    enterprise?: string,
    enterpriseWeb?: string,
    country?: string,
    token?: string,
    voiceId?: string,
    language?: any
  ) {
    this.userId = userId;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.profileImage = profileImage;
    this.enterprise = enterprise;
    this.enterpriseWeb = enterpriseWeb;
    this.country = country;
    this.token = token;
    this.voiceId = voiceId;
    this.language = language;
  }
}

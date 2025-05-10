export class User {
  name: string;
  lastname: string;
  email: string;
  password: string;
  token?: string; // <- opcional

  constructor(
    name: string,
    lastname: string,
    email: string,
    password: string,
    token?: string
  ) {
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.token = token;
  }
}

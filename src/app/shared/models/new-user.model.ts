import { Agent } from './agent.model';

export class User {
  name: string;
  lastname: string;
  email: string;
  password: string;
  profileImage?: string;
  token?: string;
  agent?: Agent;

  constructor(
    name: string,
    lastname: string,
    email: string,
    password: string,
    token?: string,
    agent?: Agent
  ) {
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.token = token;
    this.agent = agent;
  }
}

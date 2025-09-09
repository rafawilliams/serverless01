export class MissingEnvironmentData extends Error {
  constructor(message: string) {
    super(`Environment variable not passsed: ${message}`);
    this.name = "MissingEnvironmentData";
  } 
}

export class MissingBodyException extends Error {
  constructor() {
    super(`Body data is missing`);
    this.name = "ValidationException";
  } 
}

export class MissingParameters extends Error {
  constructor(parameterName: string) {
    super(`Parameter is empty: ${parameterName}`);
  }
}
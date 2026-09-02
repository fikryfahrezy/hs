export class EmailAlreadyExistsError extends Error {
  public constructor(options?: ErrorOptions) {
    super("An account with this email already exists.", options);
    this.name = "EmailAlreadyExistsError";
  }
}

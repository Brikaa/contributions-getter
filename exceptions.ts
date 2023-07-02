export class NotSuccessStatusException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotSuccessStatusException';
  }
}

export class GraphQLException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphQLException';
  }
}

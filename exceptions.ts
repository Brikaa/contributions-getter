export class NotSuccessStatusException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotSuccessStatusException';
  }
}

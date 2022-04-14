export default class RmfParsingError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, RmfParsingError.prototype);
  }
}

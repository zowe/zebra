export default class RmfDdsError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, RmfDdsError.prototype);
  }
}

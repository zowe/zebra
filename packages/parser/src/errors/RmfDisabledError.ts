export default class RmfDisabledError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, RmfDisabledError.prototype);
  }
}

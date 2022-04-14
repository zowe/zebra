export default class RmfRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, RmfRequestError.prototype);
  }
}

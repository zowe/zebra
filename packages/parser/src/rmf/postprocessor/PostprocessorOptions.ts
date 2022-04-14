import { RmfOptions } from "../types";
import { PostprocessorOptionsParams } from "./types";

export default class PostprocessorOptions implements RmfOptions {
  public file: string;

  public interval: number;

  public username?: string | undefined;

  public password?: string | undefined;

  constructor({
    username,
    password,
    file = "rmfpp.xml",
    interval = 1800,
  }: PostprocessorOptionsParams) {
    this.username = username;
    this.password = password;
    this.file = file;
    this.interval = interval;
  }
}

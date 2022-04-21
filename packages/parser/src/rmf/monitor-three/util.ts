import RmfRequestError from "../../errors/RmfRequestError";
import { TWO_DIGIT_CONFIG } from "../util";

export function ddsFormatResource(resource: string): string {
  const resourceRegex = /\S*,\S*,\S+/;
  if (!resourceRegex.test(resource)) {
    throw new RmfRequestError(
      "Invalid format for `resource` parameter. Should follow format `[ulq],[resource_name],resource_type`."
    );
  }
  return resource;
}

export function ddsFormatRange(range: { start: Date; end?: Date }): string {
  if (range.end) {
    if (range.end < range.start) {
      throw new RmfRequestError(
        "The starting time of the range must come before the ending time"
      );
    }
    const startYear = range.start
      .getFullYear()
      .toLocaleString("en-US", { useGrouping: false });
    const startMonth = (range.start.getMonth() + 1).toLocaleString(
      "en-US",
      TWO_DIGIT_CONFIG
    );
    const startDay = range.start
      .getDate()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const startHour = range.start
      .getHours()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const startMinute = range.start
      .getMinutes()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const startSecond = range.start
      .getSeconds()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const endYear = range.end
      .getFullYear()
      .toLocaleString("en-US", { useGrouping: false });
    const endMonth = (range.end.getMonth() + 1).toLocaleString(
      "en-US",
      TWO_DIGIT_CONFIG
    );
    const endDay = range.end
      .getDate()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const endHour = range.end
      .getHours()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const endMinute = range.end
      .getMinutes()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    const endSecond = range.end
      .getSeconds()
      .toLocaleString("en-US", TWO_DIGIT_CONFIG);
    return `${startYear}${startMonth}${startDay}${startHour}${startMinute}${startSecond},${endYear}${endMonth}${endDay}${endHour}${endMinute}${endSecond}`;
  }
  const year = range.start
    .getFullYear()
    .toLocaleString("en-US", { useGrouping: false });
  const month = (range.start.getMonth() + 1).toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  );
  const day = range.start.getDate().toLocaleString("en-US", TWO_DIGIT_CONFIG);
  const hour = range.start.getHours().toLocaleString("en-US", TWO_DIGIT_CONFIG);
  const minute = range.start
    .getMinutes()
    .toLocaleString("en-US", TWO_DIGIT_CONFIG);
  const second = range.start
    .getSeconds()
    .toLocaleString("en-US", TWO_DIGIT_CONFIG);
  return `${year}${month}${day}${hour}${minute}${second}`;
}

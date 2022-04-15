import RmfRequestError from "../../errors/RmfRequestError";

/** Ensures number is at least two digits when converting to string */
const TWO_DIGIT_CONFIG: Intl.NumberFormatOptions = {
  minimumIntegerDigits: 2,
  useGrouping: false,
};

/**
 * Formats the given `date` DDS parameter into a DDS readable format.
 * @param date Value of the `date` DDS parameter.
 * @returns RMF DDS readable value (`YYYYMMDD`).
 */
export function ddsFormatDate(date: Date | { start: Date; end: Date }): string {
  if (date instanceof Date) {
    const year = date
      .getFullYear()
      .toLocaleString("en-US", { useGrouping: false });
    const month = (date.getMonth() + 1).toLocaleString(
      "en-US",
      TWO_DIGIT_CONFIG
    );
    const day = date.getDate().toLocaleString("en-US", TWO_DIGIT_CONFIG);
    return `${year}${month}${day},${year}${month}${day}`;
  }
  if (date.start > date.end) {
    throw new RmfRequestError(
      "The starting `date` parameter cannot be more than the ending `date`"
    );
  }
  const startYear = date.start
    .getFullYear()
    .toLocaleString("en-US", { useGrouping: false });
  const endYear = date.end
    .getFullYear()
    .toLocaleString("en-US", { useGrouping: false });
  const startMonth = (date.start.getMonth() + 1).toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  );
  const endMonth = (date.end.getMonth() + 1).toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  );
  const startDay = date.start
    .getDate()
    .toLocaleString("en-US", TWO_DIGIT_CONFIG);
  const endDay = date.end.getDate().toLocaleString("en-US", TWO_DIGIT_CONFIG);
  return `${startYear}${startMonth}${startDay},${endYear}${endMonth}${endDay}`;
}

/**
 * Formats the given `duration` DDS parameter into a DDS readable format.
 * @param duration Value of the `duration` DDS parameter.
 * @returns RMF DDS readable value.
 */
export function ddsFormatDuration(duration: number): string {
  if (duration < 0 || duration > 6000) {
    throw new RmfRequestError(
      "Duration parameter must be a value between 0 and 6000 minutes"
    );
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  // special case maximum duration
  if (hours === 100) {
    return "9960";
  }
  return `${hours.toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  )}${minutes.toLocaleString("en-US", TWO_DIGIT_CONFIG)}`;
}

/**
 * Formats the given `joboutdel` DDS parameter into a DDS readable format.
 * @param jobOutDel Value of the `joboutdel` DDS parameter.
 * @returns RMF DDS readable value (`YES` or `NO`).
 */
export function ddsFormatJobOutDel(jobOutDel: boolean): string {
  return jobOutDel ? "YES" : "NO";
}

/**
 * Formats the given `overview` DDS parameter into a DDS readable format.
 * @param overview Value of the `overview` DDS parameter.
 * @returns RMF DDS readable value.
 */
export function ddsFormatOverview(overview: string | string[]): string {
  if (typeof overview === "string") {
    return `(${overview})`;
  }
  return overview.map((o) => `(${o})`).join(",");
}

/**
 * Formats the given `smfdata` DDS parameter into a DDS readable format.
 * @param smfData Value of the `smfdata` DDS parameter.
 * @returns RMF DDS readable value.
 */
export function ddsFormatSmfData(smfData: string | string[]): string {
  if (typeof smfData === "string") {
    return smfData;
  }
  return smfData.join(",");
}

/**
 * Formats the given `smfsort` DDS parameter into a DDS readable format.
 * @param smfSort Value of the `smfsort` DDS parameter.
 * @returns RMF DDS readable value (`YES` or `NO`).
 */
export function ddsFormatSmfSort(smfSort: boolean): string {
  return smfSort ? "YES" : "NO";
}

/**
 * Formats the given `timeofday` DDS parameter into a DDS readable format.
 * @param overview Value of the `timeofday` DDS parameter.
 * @returns RMF DDS readable value (`HHmm`).
 */
export function ddsFormatTimeOfDay(time: {
  start: number;
  end: number;
}): string {
  if (time.start < 0 || time.start > 1439 || time.end < 0 || time.end > 1439) {
    throw new RmfRequestError(
      "Time of day parameter must be between 0 minutes (representing 00:00) and 1439 minutes (representing 23:59)."
    );
  }
  if (time.start > time.end) {
    throw new RmfRequestError(
      "The starting `timeofday` parameter cannot be more than the ending `timeofday`"
    );
  }
  const startHour = Math.floor(time.start / 60);
  const startMinute = time.start % 60;
  const startTime = `${startHour.toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  )}${startMinute.toLocaleString("en-US", TWO_DIGIT_CONFIG)}`;
  const endHour = Math.floor(time.end / 60);
  const endMinute = time.end % 60;
  const endTime = `${endHour.toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  )}${endMinute.toLocaleString("en-US", TWO_DIGIT_CONFIG)}`;
  return `${startTime},${endTime}`;
}

/**
 * Formats the given `timeout` DDS parameter into a DDS readable format.
 * @param timeout Value of the `timeout` DDS parameter.
 * @throws {RmfRequestError} Thrown if the given `timeout` value is invalid.
 * @returns RMF DDS readable value.
 */
export function ddsFormatTimeout(timeout: number): string {
  if (timeout < 0 || timeout > 3600) {
    throw new RmfRequestError(
      "Timeout parameter must be a value between 0 and 3600 seconds."
    );
  }
  return timeout.toLocaleString("en-US", { useGrouping: false });
}

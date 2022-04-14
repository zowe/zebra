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
export function ddsFormatDate(date: Date): string {
  const year = date
    .getFullYear()
    .toLocaleString("en-US", { useGrouping: false });
  const month = (date.getMonth() + 1).toLocaleString("en-US", TWO_DIGIT_CONFIG);
  const day = date.getDate().toLocaleString("en-US", TWO_DIGIT_CONFIG);
  return `${year}${month}${day}`;
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
export function ddsFormatTimeOfDay(time: number): string {
  if (time < 0 || time > 1439) {
    throw new RmfRequestError(
      "Time of day parameter must be between 0 minutes (representing 00:00) and 1439 minutes (representing 23:59)."
    );
  }
  const hour = Math.floor(time / 60);
  const minute = time % 60;
  return `${hour.toLocaleString(
    "en-US",
    TWO_DIGIT_CONFIG
  )}${minute.toLocaleString("en-US", TWO_DIGIT_CONFIG)}`;
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

import { parseString, ParserOptions } from "xml2js";
import RmfParsingError from "../errors/RmfParsingError";

/**
 * Configuration to use for `xml2js` package.
 */
export const XML2JS_CONFIG: ParserOptions = {
  explicitArray: false,
  mergeAttrs: true,
  charkey: "content",
};

/** Ensures number is at least two digits when converting to string */
export const TWO_DIGIT_CONFIG: Intl.NumberFormatOptions = {
  minimumIntegerDigits: 2,
  useGrouping: false,
};

/**
 * Checks if the XML response obtained from the RMF Distributed Data Server contains
 * an error message.
 * @param xml Response from DDS in XML string format.
 * @returns Error message if one exists, null otherwise.
 */
export function checkForError(xml: string): string | null {
  // This regular expression will locate error messages in the XML without parsing the whole document.
  const regex =
    /<message id="GPM.*">\s*<description>.*<\/description>\s*<severity>\d<\/severity>\s*<\/message>/;
  const matches = regex.exec(xml);
  if (matches && matches.length > 0) {
    const errorMessage: string[] = [];
    matches.forEach((match) => {
      parseString(match, XML2JS_CONFIG, (err, result) => {
        if (err) throw new RmfParsingError(err.message);
        errorMessage.push(
          `${result?.message?.id} - ${result?.message?.description} (SEVERITY: ${result?.message?.severity})`
        );
      });
    });
    return `The RMF DDS has returned the following error(s): ${errorMessage.join(
      ", "
    )}`;
  }
  return null;
}

/**
 * Formats the given RMF report suboption(s) into DDS readable format.
 * @param suboptions A single string or list of strings representing report suboptions.
 * @returns RMF DDS readable suboptions.
 */
export function ddsFormatSuboptions(suboptions: string | string[]): string {
  if (typeof suboptions === "string") {
    return `(${suboptions})`;
  }
  return `(${suboptions.join(",")})`;
}

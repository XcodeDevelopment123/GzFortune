import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StringHelperService {
  constructor() {}

  /**
   * Removes all whitespace characters from the input string.
   * This includes leading, trailing, and any whitespace between characters.
   *
   * @param input The string to process.
   * @returns The string with all whitespace removed.
   *
   * Example:
   *   removeAllWhiteSpace('  a b  c ') // returns 'abc'
   */
  removeAllWhiteSpace(input: string): string {
    return input.replace(/\s+/g, '');
  }
}

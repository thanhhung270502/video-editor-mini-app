/**
 * Converts an enum string to a human-readable label.
 * E.g. "USER_ROLE_ADMIN" becomes "User Role Admin".
 *
 * @param {string} str - The enum string to format.
 * @returns {string} The formatted label.
 */
export const formatEnumToLabel = (str: string) =>
  str
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

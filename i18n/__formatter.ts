/** Default formatters to use inside of a translation value. */
export const defaultFormatters = {
  /** Transforms the given string to uppercase. */
  upper(v?: string | null) {
    return v?.toUpperCase() ?? '';
  },
  /** Transforms the given string to lowercase. */
  lower(v?: string | null) {
    return v?.toLowerCase() ?? '';
  },
  /** Capitalizes the given string. */
  capitalize(v?: string | null) {
    return v ? `${v.charAt(0).toUpperCase()}${v.slice(1)}` : '';
  },
  /** Transforms the given string to title case. */
  title(v?: string | null) {
    return v?.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()) ?? '';
  },
};

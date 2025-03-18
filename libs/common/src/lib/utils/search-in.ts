export function splitIn(inValue?: string | string[] | null) {
  if (!inValue) {
    inValue = '';
  }
  return (Array.isArray(inValue) ? inValue : inValue.split(',')).map((s) =>
    String(s).trim()
  );
}

export function searchIn(
  searchValue?: string | string[] | null,
  inValue?: string | string[] | null
) {
  const searchValueArr = splitIn(searchValue);

  const inValueArr = splitIn(inValue);

  const result = Boolean(
    inValueArr.find((a) => searchValueArr.find((s) => s.includes(a)))
  );

  return result;
}

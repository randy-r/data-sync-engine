export function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export function validateNonEmptyString(s: string) {
  const isString = typeof s === 'string';
  if (!isString || s.length === 0)
    throw new Error('Passed value must be a non empty string');
}

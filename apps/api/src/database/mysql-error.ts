const MYSQL_ERROR_CODE = {
  duplicateEntry: "ER_DUP_ENTRY",
} as const;

export function isMysqlDuplicateEntryError(
  error: unknown,
  constraintName: string,
): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === MYSQL_ERROR_CODE.duplicateEntry &&
    error.message.includes(constraintName)
  );
}

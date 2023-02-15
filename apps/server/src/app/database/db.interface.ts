export interface DbInterface {
  isAlreadyExist(
    value: unknown,
    entity: string,
    field: string
  ): Promise<boolean>;
}

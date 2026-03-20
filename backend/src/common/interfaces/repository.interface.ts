export interface IRepository<T> {
  findById(id: number, relations?: string[]): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  count(where?: Partial<T>): Promise<number>;
}

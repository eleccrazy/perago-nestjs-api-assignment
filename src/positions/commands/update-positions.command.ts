export class UpdatePositionsCommand {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly parentId?: string,
  ) {}
}

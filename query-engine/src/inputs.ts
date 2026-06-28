export type InputsInterface = InstanceType<typeof Inputs>;

export class Inputs {
  private stuff: Record<string, unknown> = {};
  constructor() {}
  Has(key: string): boolean {
    return key in this.stuff;
  }
  Get(key: string): unknown {
    return this.stuff[key];
  }
  Set(key: string, value: unknown): void {
    this.stuff[key] = value;
  }
  ForEach(fn: (entry: [string, unknown]) => void) {
    Object.entries(this.stuff).forEach(fn);
  }
  Clone() {
    return Inputs.From(this.stuff);
  }
  static From(obj: Record<string, unknown>) {
    const inputs = new Inputs();
    Object.entries(obj).forEach(([key, value]) => inputs.Set(key, value));
    return inputs;
  }
}

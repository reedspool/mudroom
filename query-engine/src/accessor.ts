export type AccessorInterface = InstanceType<typeof Accessor>;

export class Accessor {
  constructor(
    readonly host: string,
    readonly port: string | number,
    readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async GetText(path: string) {
    const url = `https://${this.host}:${this.port}/${path.startsWith("/") ? path.slice(1) : path}`;
    console.log(`Accessor requesting ${url}`);
    const response = await this.fetchImpl(url);
    return response.text();
  }
}

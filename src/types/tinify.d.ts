declare module 'tinify' {
  export interface ResizeOptions {
    method: 'scale' | 'fit' | 'cover';
    width?: number;
    height?: number;
  }

  export interface Source {
    resize(options: ResizeOptions): Source;
    toBuffer(): Promise<Buffer>;
  }

  export function fromBuffer(buffer: Buffer): Source;
  export function fromFile(path: string): Source;
  export function fromUrl(url: string): Source;

  export const key: string;
  export const proxy: string | undefined;
}
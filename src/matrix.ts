export class Matrix {
  w: number = -1;
  h: number = -1;
  data: number[][];

  constructor(matrix: number[][]) {
    this.h = matrix.length;
    if (this.h <= 0) throw new Error("Size should be > 0");
    this.w = matrix[0].length;
    if (this.w <= 0) throw new Error("Size should be > 0");
    if (matrix.some((v) => v.length !== this.w)) throw new Error("All sub-arrays should be sam size");
    this.data = matrix;
  }

  add = (b: Matrix): Matrix => Matrix.add(this, b);

  static add = (a: Matrix, b: Matrix): Matrix => {
    if (a.w !== b.w || a.h !== b.h) throw new Error("Size doesn't match");
    const w = a.w, h = a.h;
    const data: number[][] = [];
    for (let y = 0; y < h; y++) {
      data[y] = [];
      for (let x = 0; x < w; x++) {
        data[y][x] = a.data[y][x] + b.data[y][x];
      }
    }
    return new Matrix(data);
  };

  mult = (b: Matrix): Matrix => Matrix.mult(this, b);

  static mult = (a: Matrix, b: Matrix): Matrix => {
    if (a.w !== b.h) throw new Error("Size doesn't match");
    const n = a.h, m = a.w, p = b.w;
    const data: number[][] = [];
    for (let i = 0; i < n; i++) {
      data[i] = [];
      for (let j = 0; j < p; j++) {
        data[i][j] = 0;
        for (let k = 0; k < m; k++) {
          data[i][j] += a.data[i][k] * b.data[k][j];
        }
      }
    }
    return new Matrix(data);
  };

  toString(): string {
    return `[${this.data.map(r => `[${r.join(",")}]`)}]`
  }
}
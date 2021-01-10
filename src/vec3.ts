export class vec3 {
  constructor(private e: number[]) {}

  get x() {
    return this.e[0];
  }

  get y() {
    return this.e[1];
  }

  get z() {
    return this.e[2];
  }

  public negate() {
    return new vec3([-this.e[0], -this.e[1], -this.e[2]]);
  }

  public get(i: number) {
    return this.e[i];
  }

  // *** Mutable Functions ***
  public addMutate(other: vec3): vec3 {
    this.e[0] += other.x;
    this.e[1] += other.y;
    this.e[2] += other.z;

    return this;
  }

  public multiplyMutate(scale: number): vec3 {
    this.e[0] *= scale;
    this.e[1] *= scale;
    this.e[2] *= scale;

    return this;
  }

  public divideMutate(scale: number): vec3 {
    return this.multiplyMutate(1/scale);
  }

  // *** Immutable functions ***
  public add(other: vec3): vec3 {
    return new vec3([this.e[0] + other.e[0], this.e[1] + other.e[1], this.e[2] + other.e[2]]);
  }

  public subtract(other: vec3): vec3 {
    return new vec3([this.e[0] - other.e[0], this.e[1] - other.e[1], this.e[2] - other.e[2]]);
  }

  public multiply(other: vec3): vec3 {
    return new vec3([this.e[0] * other.e[0], this.e[1] * other.e[1], this.e[2] * other.e[2]]);
  }

  public scaleUp(scale: number): vec3 {
    return new vec3([this.e[0] * scale, this.e[1] * scale, this.e[2] * scale]);
  }

  public scaleDown(scale: number): vec3 {
    return this.scaleUp(1/scale);
  }

  public dot(other: vec3): number {
    return (this.e[0] * other.e[0]) + (this.e[1] * other.e[1]) + (this.e[2] * other.e[2]);
  }

  public cross(other: vec3): vec3 {
    return new vec3([this.e[1] * other.e[2] - this.e[2] * other.e[1],
                    this.e[2] * other.e[0] - this.e[0] * other.e[2],
                    this.e[0] * other.e[1] - this.e[1] * other.e[0]]);
  }

  public unit(): vec3 {
    return this.scaleDown(this.length());
  }

  public length(): number {
    return Math.sqrt(this.length_squared());
  }

  public length_squared(): number {
    return (this.e[0] * this.e[0]) + (this.e[1] * this.e[1]) + (this.e[2] * this.e[2]);
  }

  public toString(): string {
    return `${this.e[0]} ${this.e[1]} ${this.e[2]}`
  }

}
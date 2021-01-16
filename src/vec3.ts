export class vec3 {

  private readonly ZERO_TOLERANCE = 1e-8;

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

  get arr() {
    return this.e
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

  public scale(scale: number): vec3 {
    return new vec3([this.e[0] * scale, this.e[1] * scale, this.e[2] * scale]);
  }

  public scaleDown(scale: number): vec3 {
    return this.scale(1/scale);
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

  public near_zero(): boolean {
    return (Math.abs(this.e[0]) < this.ZERO_TOLERANCE) 
        && (Math.abs(this.e[1]) < this.ZERO_TOLERANCE) 
        && (Math.abs(this.e[2]) < this.ZERO_TOLERANCE);
  }

  public reflect(n: vec3): vec3 {
    return this.subtract(n.scale(this.dot(n) * 2));
  }

  public refract(n: vec3, etai_over_etat: number) {
    const uv = this;
    const cos_theta = Math.min(uv.negate().dot(n), 1.0);
    const r_out_perp = uv.add(n.scale(cos_theta)).scale(etai_over_etat);
    const r_out_para = n.scale(0 - Math.sqrt(Math.abs(1 - r_out_perp.length_squared())));
    return r_out_perp.add(r_out_para);
  }

  public toString(): string {
    return `${this.e[0]} ${this.e[1]} ${this.e[2]}`
  }

  public toJSON(): any {
    return {
      _type: 'vec3',
      e: this.e
    }
  }
}
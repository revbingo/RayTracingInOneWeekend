export function negate(vec: number[]) {
  return [-vec[0], -vec[1], -vec[2]];
}

// *** Immutable functions ***
export function add(a: number[], b: number[]): number[] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subtract(a: number[], b: number[]): number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function multiply(a: number[], b: number[]): number[] {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

export function scale(a: number[], scale: number): number[] {
  return [a[0] * scale, a[1] * scale, a[2] * scale];
}

export function scaleDown(a: number[], scaleN: number): number[] {
  return scale(a, 1/scaleN);
}

export function dot(a: number[], b: number[]): number {
  return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
}

export function cross(a: number[], b: number[]): number[] {
  return [a[1] * b[2] - a[2] * b[1],
                  a[2] * b[0] - a[0] * b[2],
                  a[0] * b[1] - a[1] * b[0]];
}

export function unit(a: number[]): number[] {
  return scaleDown(a, length(a));
}

export function length(a: number[]): number {
  return Math.sqrt(length_squared(a));
}

export function length_squared(a: number[]): number {
  return (a[0] * a[0]) + (a[1] * a[1]) + (a[2] * a[2]);
}

export function near_zero(a: number[]): boolean {
  return (Math.abs(a[0]) < 1e-8) 
      && (Math.abs(a[1]) < 1e-8) 
      && (Math.abs(a[2]) < 1e-8);
}

export function reflect(a: number[], n: number[]): number[] {
  return subtract(a, scale(n, dot(a, n) * 2));
}

export function refract(uv: number[], n: number[], etai_over_etat: number): number[] {
  const cos_theta = Math.min(dot(negate(uv), n), 1.0);
  const r_out_perp = scale(add(uv, scale(n, cos_theta)), etai_over_etat);
  const r_out_para = scale(n, 0 - Math.sqrt(Math.abs(1 - length_squared(r_out_perp))));
  return add(r_out_perp, r_out_para);
}
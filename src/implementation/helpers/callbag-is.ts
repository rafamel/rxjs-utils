import { Callbags as Types } from '@definitions';

export function isCallbagStart<O, I>(
  type: Types.Type,
  _data: Types.DataType<O, I>
): _data is Types.Callbag<O, I> {
  return type === 0;
}

export function isCallbagData<O, I>(
  type: Types.Type,
  _data: Types.DataType<O, I>
): _data is I {
  return type === 1;
}

export function isCallbagEnd<O, I>(
  type: Types.Type,
  _data: Types.DataType<O, I>
): _data is Error | undefined {
  return type === 2;
}

import { Observable, PushStream, of, from } from '@push';
import { compliance } from '../../es-observable/compliance';
import assert from 'assert';

PushStream.configure({ onUnhandledError: null });
const StreamConstructor: any = PushStream;
StreamConstructor.of = of;
StreamConstructor.from = from;

test(`Observable passes compliance tests`, async () => {
  const response = await compliance('Observable', Observable, 'silent', true);
  assert(response.result[1].length === 0);
});

test(`PushStream passes partial compliance tests`, async () => {
  const response = await compliance(
    'PushStream',
    StreamConstructor,
    'silent',
    false
  );
  assert(response.result[1].length === 0);
});

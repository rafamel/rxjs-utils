import { Create, Observable, PushStream } from '@push';
import { Handler } from '@helpers';
import { compliance } from '../../es-observable/compliance';
import assert from 'assert';

const StreamConstructor: any = PushStream;
StreamConstructor.of = Create.of;
StreamConstructor.from = Create.from;
process.on('unhandledRejection', Handler.noop);

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

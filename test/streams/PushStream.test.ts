import { PushStream } from '../../src';
import compliance from '../es-observable/compliance';

test(`Complies with Observable spec`, async () => {
  const response = await compliance('PushStream', PushStream, 'silent');
  expect(response.result[1].length).toBe(0);
});

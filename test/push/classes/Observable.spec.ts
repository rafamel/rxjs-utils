import { Observable } from '@push';
import { compliance } from '../../es-observable/compliance';
import assert from 'assert';

Observable.configure({ onUnhandledError: null });

test(`Observable passes compliance tests`, async () => {
  const response = await compliance('Observable', Observable, 'silent');
  assert(response.result[1].length === 0);
});

import { test } from '@jest/globals';
import assert from 'assert';
import { Observable, configure } from '@push';
import { compliance } from '../../es-observable/compliance';

configure({ onUnhandledError: null });

test(`Observable passes compliance tests`, async () => {
  const response = await compliance('Observable', Observable, 'silent');
  assert(response.result[1].length === 0);
});

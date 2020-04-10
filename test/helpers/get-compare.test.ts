import { getCompare } from '~/helpers/get-compare';
import { compare } from 'equal-strategies';

jest.mock('equal-strategies');
const mocks: Record<any, jest.Mock> = { compare } as any;

beforeEach(() => Object.values(mocks).map((mock) => mock.mockClear()));

test(`calls compare`, () => {
  getCompare()('foo', 'foo');
  expect(mocks.compare).toHaveBeenCalled();
});
test(`calls strict compare w/ undefined`, () => {
  getCompare()('foo', 'foo');
  expect(mocks.compare).toHaveBeenLastCalledWith('strict', 'foo', 'foo');
});
test(`calls strict compare w/ undefined property`, () => {
  getCompare({})('foo', 'foo');
  expect(mocks.compare).toHaveBeenLastCalledWith('strict', 'foo', 'foo');
});
test(`calls strict compare w/ value`, () => {
  getCompare({ compare: 'value' as any })('foo', 'foo');
  expect(mocks.compare).toHaveBeenLastCalledWith('value', 'foo', 'foo');
});

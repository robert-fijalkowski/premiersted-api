/* eslint-env jest */
const { requiredProps } = require('./helper');
const { BadRequest } = require('./exceptions');

describe('helper functions', () => {
  it('should fail on missing props', () => {
    const next = jest.fn();
    const condition = requiredProps('prop1');
    expect(() => condition({ body: {} }, null, next)).toThrowError(BadRequest);
    expect(next).toHaveBeenCalledTimes(0);
  });
  it('should pass to next on existing props', () => {
    const next = jest.fn();
    const condition = requiredProps('prop1');
    condition({ body: { prop1: 'value' } }, null, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should fail on missing path', () => {
    const next = jest.fn();
    const condition = requiredProps(['prop1', 'value']);
    expect(() => condition({ body: { prop1: 'value' } }, null, next)).toThrowError(BadRequest);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it.skip('should pass to next on existing path', () => {
    const next = jest.fn();
    const condition = requiredProps(['prop1', 'value', 'value2']);
    condition({ body: { prop1: { value: { value2: 'otherVal' } } } }, null, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.skip('should pass to next on existing path', () => {
    const next = jest.fn();
    const condition = requiredProps(['prop1', ['value', 'value2']]);
    condition({ body: { prop1: { value: 'otherVal', value2: 'someVal' } } }, null, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});


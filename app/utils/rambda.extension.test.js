/* eslint-env jest */
require('./rambda.extension');
const R = require('ramda');

describe('check ramdba extensions', () => {
  it('should create map basing on mapTo', () => {
    const result = R.mapTo(
      R.prop('key'), R.identity,
      [{ key: 'id', val: 'value' }, { key: 'id2', val: 'value2' }],
    );
    expect(result).toEqual({
      id: { key: 'id', val: 'value' },
      id2: { key: 'id2', val: 'value2' },
    });
  });
  it('should create map basing on mapTo with variated valueFn', () => {
    const result = R.mapTo(
      R.prop('key'), R.omit(['key']),
      [{ key: 'id', val: 'value' }, { key: 'id2', val: 'value2' }],
    );
    expect(result).toEqual({
      id: { val: 'value' },
      id2: { val: 'value2' },
    });
  });
  it('should check if all props are set to true', () => {
    const areSet = R.required(['prop1'], {
      prop1: 'set',
    });
    expect(areSet).toEqual(true);
  });
  it('should check if all props are set to false', () => {
    const areSet = R.required(['prop1', 'prop2'], {
      prop1: 'set',
    });
    expect(areSet).toEqual(false);
  });

  it('should check if all props but avoid ordering', () => {
    const areSet = R.required(['prop2', 'prop1'], {
      prop3: 'set',
      prop1: 'set',
      prop2: 'set',
    });
    expect(areSet).toEqual(true);
  });
});


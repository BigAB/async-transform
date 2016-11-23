import QUnit from 'steal-mocha';
import chai from 'chai';
import asyncTransform from '../async-transform';

const assert = chai.assert;

describe( 'async-transform', () => {

  it( 'should return a promise when given a list of transforms and a value', () => {
    const returnValue = asyncTransform( [], 'anyValue' );
    assert.ok( returnValue instanceof Promise, 'It returns a promise' );
  } );

  it( 'should create a partially applied function of the transform functions of no value is provided', () => {
    const transformFunctions = [
      v => v+1,
      v => Promise.resolve(v*2),
      v => v*v,
      v => Promise.resolve({ value: v })
    ];

    const process = asyncTransform( transformFunctions );

    assert.ok( process instanceof Function, 'it returns a function' );
    assert.equal( process.length, 1, 'returned function has an arity of 1' );
    const p = process(3);
    assert.ok( p instanceof Promise, 'when calle returned function returns a promise' );

    p.then( v => {
      assert.equal( v.value, 64, 'resolved the correct value' );
    } );
  } );

  it( 'should call the transform functions with a context if context arg passed', (done) => {
    class Thing {
      constructor(baseValue) {
        this.value = baseValue;
      }
      addValue(v) {
        return v + this.value;
      }
      multiplyValue(v) {
        return v * this.value;
      }
      wrap(v) {
        return { value: v };
      }
      calculate(v) {
        const transforms = [
          this.addValue,
          this.multiplyValue,
          this.wrap
        ];
        return asyncTransform(transforms, v, this);
      }
    };
    const thing = new Thing(3);
    thing.calculate(2)
      .then(actual => {
        assert.deepEqual(actual , { value: 15 }, 'The context of the transform functions was correct' );
        done();
      }).catch(done);
  } );

} );

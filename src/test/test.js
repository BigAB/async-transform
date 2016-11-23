import QUnit from 'steal-mocha';
import chai from 'chai';
import asyncTransform from '../async-transform';

const assert = chai.assert;

describe( 'async-transform', () => {

  it( 'should return a promise when given a list of transforms and a value', () => {
    const returnValue = asyncTransform( [], 'anyValue' );
    assert.ok( returnValue instanceof Promise, 'It returns a promise' );
  } );

} );

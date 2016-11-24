function asyncTransform( transforms, val, context ) {
  if ( typeof val === 'undefined' ) {
    return v => asyncTransform( transforms, v, context );
  }
  const v = Promise.resolve( val );
  if ( context ) {
    transforms = transforms.map( t => v => t.call( context, v ) );
  }
  return transforms.reduce( ( p, t ) => p.then( t ), v );
}

export default asyncTransform;

import React from 'react'
import getDisplayName from 'recompose/getDisplayName'
import setDisplayName from 'recompose/setDisplayName'

// doConcat : Component -> Component -> Component
export default ComponentA => ComponentB =>
  setDisplayName(
    [ComponentB, ComponentA].map(getDisplayName).filter(s => s != null && s !== '').join(' + ')
  )(props => [<ComponentB key={0} {...props} />, <ComponentA key={1} {...props} />])

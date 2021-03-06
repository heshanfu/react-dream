![react-dream-logo](banner.png)

# React Dream

[![Build Status](https://travis-ci.org/xaviervia/react-dream.svg)](https://travis-ci.org/xaviervia/react-dream)
[![npm version](https://img.shields.io/npm/v/react-dream.svg?maxAge=1000)](https://www.npmjs.com/package/react-dream)

[Fantasy Land](https://github.com/fantasyland/fantasy-land) type for [React Components](https://facebook.github.io/react/)

**Caution: Experimental** (not _extremely_ anymore though)

## Installation

```
npm add react-dream
```

You will also need a couple of peer dependencies:

```
npm add react recompose
```

## Table of contents

- [Usage](#usage)
- [API](#api)
  - [map](#mapcomponent--enhancedcomponent)
  - [contramap](#contramapprops--modifiedprops)
  - [promap](#promapprops--modifiedprops-component--enhancedcomponent)
  - [ap + of](#ap--of)
  - [chain](#chain)
  - [fork](#forkcomponent--)
  - [addProps](#addpropsprops--propstoadd--object)
  - [removeProps](#removepropspropnamestoremove--string)
  - [defaultProps](#defaultpropsprops--object)
  - [propTypes](#proptypesproptypes--object)
  - [style](#styleprops--stylestoadd--object)
  - [name](#namenewdisplayname--string)
  - [rotate](#rotateprops--rotation--number)
  - [scale](#scaleprops--scalefactor--number)
  - [translate](#translateprops--x--number-y--number-z--number)
  - [log](#logprops--value--any)
  - [debug](#debug)
- [Built-in primitives](#built-in-primitives)

## Usage

### Lifting React components into ReactDream

For example, for a ReactNative View:

```js
import ReactDream from 'react-dream'
import { View } from 'react-native'

const DreamView = ReactDream(View)
```

…or for a web `div`:

```js
import React from 'react'
import ReactDream from 'react-dream'

const DreamView = ReactDream(props => <div {...props} />)
```

### Complete example

Here is an extensive example that can be found in [examples](https://github.com/xaviervia/react-dream-examples/blob/master/pages/index.js):

> If you are not familiar with Fantasy Land types, I can highly recommend the [video tutorials by Brian Lonsdorf](https://egghead.io/instructors/brian-lonsdorf)

> Note that this and the following examples use already-built wrappers that you can pull from [react-dream-web-builtins](https://github.com/xaviervia/react-dream-web-builtins). This are convenient but might not be easy to tree shake when bundling, so use with caution.

```js
import React from 'react'
import { render } from 'react-dom'
import { withHandlers, withState } from 'recompose'
import { of } from 'react-dream'
import { Html } from 'react-dream-web-builtins'

const withChildren = North => South => Wrapper => ({ north, south, wrapper, ...props }) =>
  <Wrapper { ...props } { ...wrapper }}>
    <North { ...props } { ...north }} />
    <South { ...props } { ...south }} />
  </Wrapper>

const Title = Html.H1
  .style(() => ({
    fontFamily: 'sans-serif',
    fontSize: 18,
  }))
  .name('Title')

const Tagline = Html.P
  .style(() => ({
    fontFamily: 'sans-serif',
    fontSize: 13,
  }))
  .name('Tagline')

const HeaderWrapper = Html.Header
  .removeProps('clicked', 'updateClicked')
  .style(({ clicked }) => ({
    backgroundColor: clicked ? 'red' : 'green',
    cursor: 'pointer',
    padding: 15,
  }))
  .name('HeaderWrapper')
  .map(
    withHandlers({
      onClick: ({ clicked, updateClicked }) => () => updateClicked(!clicked),
    })
  )
  .map(withState('clicked', 'updateClicked', false))

const Header = of(withChildren)
  .ap(Title)
  .ap(Tagline)
  .ap(HeaderWrapper)
  .contramap(({ title, tagline }) => ({
    north: { children: title },
    south: { children: tagline },
  }))
  .name('Header')

Header.fork(Component =>
  render(
    <Component
      title="Hello World"
      tagline="Of Fantasy Land Types for React"
    />,
    document.getElementById('root')
  )
)
```

Render part could also be written:

```js
render(
  <Header.Component
    title="Hello World"
    tagline="Of Fantasy Land Types for React"
  />,
  document.getElementById('root')
)
```

### Pointfree style

All methods of `ReactDream` are available as functions that can be partially applied and then take the ReactDream component as the last argument. This makes it possible to write compositions that can then be applied to a ReactDream object. The elements of the example above could be rewritten as:

```js
import React from 'react'
import { render } from 'react-dom'
import { compose, withHandlers, withState } from 'recompose'
import { ap, removeProps, contramap, map, name, of, style } from 'react-dream'
import { Html } from 'react-dream-web-builtins'

const withChildren = North => South => Wrapper => ({ north, south, wrapper, ...props }) =>
  <Wrapper { ...props } { ...wrapper }}>
    <North { ...props } { ...north }} />
    <South { ...props } { ...south }} />
  </Wrapper>

const Title = compose(
  name('Title'),
  style(() => ({
    fontFamily: 'sans-serif',
    fontSize: 18,
  }))
)(Html.H1)

const Tagline = compose(
  name('Tagline'),
  style(() => ({
    fontFamily: 'sans-serif',
    fontSize: 13,
  }))
)(Html.P)

const HeaderWrapper = compose(
  map(withState('clicked', 'updateClicked', false)),
  map(
    withHandlers({
      onClick: ({ clicked, updateClicked }) => () => updateClicked(!clicked),
    })
  ),
  name('HeaderWrapper'),
  style(({ clicked }) => ({
    backgroundColor: clicked ? 'red' : 'green',
    cursor: 'pointer',
    padding: 15,
  })),
  removeProps('clicked', 'updateClicked')
)(Html.Header)

const Header = compose(
  name('Header'),
  contramap(({ title, tagline }) => ({
    north: { children: title },
    south: { children: tagline },
  })),
  ap(HeaderWrapper),
  ap(Tagline),
  ap(Title)
)(of(withChildren))
```

## API

The following are the methods of objects of the ReactDream type. There are two types of methods:

- Algebras: they come from Fantasy Land, and they are defined following that specification.
- Helpers: they are derivations (use cases) of the methods that come from the algebras. Added for convenience.

ReactDream implements these Fantasy Land algebras:

- Profunctor (map, contramap, promap)
- Applicative (of, ap)
- Monad (chain)

Check [Fantasy Land](https://github.com/fantasyland/fantasy-land) for more details.

### map(Component => EnhancedComponent)

`map` allows to wrap the function with regular higher-order components, such as the ones provided by [recompose](https://github.com/acdlite/recompose).

```js
import React from 'react'
import ReactDream from 'react-dream'
import { withHandlers, withState } from 'recompose'

const Counter = ReactDream(({counter, onClick}) =>
  <div>
    <button onClick={onClick}>Add 1</button>
    <p>{counter}</p>
  </div>
)
  .map(
    withHandlers({
      onClick: ({ counter, updateCount }) => () => updateCount(counter + 1),
    })
  )
  .map(withState('counter', 'updateCount', 0))
```

This is because `map` expects a function from `a -> b` in the general case but from `Component -> a` in this particular case since holding components is the intended usage of ReactDream. Higher-order components are functions from `Component -> Component`, so they perfectly fit the bill.

### contramap(props => modifiedProps)

`contramap` allows to preprocess props before they reach the component.

```js
const Title = H1
  .contramap(({label}) => ({
    children: label
  }))
  .name('Title')

render(
  <Title.Component
    label='This will be the content now'
  />,
  domElement
)
```

This is a common pattern for higher-order Components, and the key advantage of using `contramap` instead of `map` for this purpose is that if the wrapped component is a stateless, function component, you avoid an unnecessary call to React. Another advantage is that functions passed to `contramap` as an argument are simply pure functions, without mentioning React at all, with the signature `Props -> Props`.

### promap(props => modifiedProps, Component => EnhancedComponent)

`promap` can be thought of as a shorthand for doing `contramap` and `map` at the same time. The first argument to it is the function that is going to be used to `contramap` and the second is the one to be used to `map`:

```js
const Header = Html.Div
  .promap(
    ({title}) => ({children: title}),
    setDisplayName('Header')
  )
```

### ap + of

`ap` allows you to apply a higher-order components to regular components, and `of` allows you to lift any value to `ReactDream`, which is useful for lifting higher-order components.

Applying second-order components (`Component -> Component`) can also be done with `map`: where `ap` shines is in allowing you to apply a higher-order component that takes two or more components (third or higher order, such as `Component -> Component -> Component -> Component`), that is otherwise not possible with `map`. This makes it possible to abstract control flow or composition patterns in higher-order components:

**Control flow example**

```js
const eitherLeftOrRight = Left => Right => ({left, ...props}) =>
  left
    ? <Left {...props} />
    : <Right {...props} />

const TitleOrSubtitle = of(eitherLeftOrRight)
  .ap(Html.H1)
  .ap(Html.H2)
  .addProps({isTitle} => ({
    left: isTitle
  }))

render(
  <TitleOrSubtitle.Component isTitle={true}>
    This will be an H1 title
  </TitleOrSubtitle.Component>
  , domElement
)
```

**Parent-children pattern example**

```js
const withChildren = North => South => Wrapper => ({north, south, wrapper, ...props}) =>
  <Wrapper { ...props } { ...wrapper }}>
    <North { ...props } { ...north }} />
    <South { ...props } { ...south }} />
  </Wrapper>

const PageHeader = of(withChildren)
  .ap(Html.H1)
  .ap(Html.P)
  .ap(Html.Header)
  .addProps({title, subtitle} => ({
    north: { children: title },
    south: { children: subtitle },
  }))

render(
  <PageHeader.Component
    title='Hello World'
    subtitle='Lorem ipsum dolor sit amet et consectetur'
  />
  , domElement
)
```

### chain

`chain` is useful as a escape hatch if you want to escape from ReactDream and do something very React-y

```js
import ReactDream from 'react-dream'
import { Svg } from 'react-dream-web-builtins'

const wrapWithGLayer = Component => ReactDream(props =>
  <g>
    <Component {...props} />
  </g>
)

const LayerWithCircle = Svg.Circle
  .contramap(() => ({
    r: 5,
    x: 10,
    y: 10
  })
  .chain(wrapWithGLayer)
```

Aside from Fantasy Land algebras, ReactDream provides the methods:

### fork(Component => {})

Calls the argument function with the actual component in the inside. This function is intended to be used to get the component for rendering, which is a side effect:

```js
H1.fork(Component => render(<Component>Hello</Component>, domElement))
```

### addProps(props => propsToAdd : Object)

`addProps` allows you to pass a function whose result will be merged with the regular props. This is useful to add derived props to a component:

```js
import { Svg } from 'react-dream-web-builtins'

const Picture = Svg.Svg
  .addProps(props => ({
    viewBox: `0 0 ${props.width} ${props.height}`
  }))

render(
  <Picture.Component
    width={50}
    height={50}
  />,
  domElement
)
```

The new props will be merged below the regular ones, so that the consumer can always override your props:

```diff
import { Svg } from 'react-dream-web-builtins'

const Picture = Svg.Svg
  .addProps(props => ({
+    // This will be now ignored
    viewBox: `0 0 ${props.width} ${props.height}`
  }))

render(
  <Picture.Component
+    viewBox='0 0 100 100'
    width={50}
    height={50}
  />,
  domElement
)
```

#### `addProps` is a use case of `contramap`

```js
.addProps(({width, height}) => ({
  viewBox: `0 0 ${props.width} ${props.height}`
}))
```

…is equivalent to:

```js
.contramap(props => ({
  ...props,
  viewBox: `0 0 ${props.width} ${props.height}`
}))
```

### removeProps(...propNamesToRemove : [String])

`removeProps` filters out props. Very useful to avoid the React warnings of unrecognized props.

```js
const ButtonWithStates = Html.Button
  .removeProps('hovered', 'pressed')
  .style(({hovered, pressed}) => ({
    color: pressed ? 'red' : (hovered ? 'orange' : 'black')
  }))
```

#### `removeProps` is an use case of `contramap`

```js
.removeProps('title', 'hovered')
```

…is equivalent to:

```js
.contramap(({title, hovered, ...otherProps}) => otherProps)
```

### defaultProps(props : Object)

`defaultProps` allows you to set the, well, `defaultProps` of the wrapped React component.

```js
const SubmitButton = Html.Button
  .defaultProps({ type: 'submit' })
```

#### `defaultProps` is an use case of `map`

```js
const SubmitButton = Html.Button
  .defaultProps({ type: 'submit' })
```

Under the hood is using `recompose`’s `defaultProps` function:

```js
import { defaultProps } from 'recompose'

const SubmitButton = Html.Button
  .map(defaultProps({ type: 'submit' }))
```

### propTypes(propTypes : Object)

`propTypes` sets the `propTypes` of the React component.

```js
import PropTypes from 'prop-types'

const Title = Html.H1
  .style(({ highlighted }) => ({
    backgroundColor: highlighted ? 'yellow' : 'transparent'
  }))
  .propTypes({
    children: PropTypes.node,
    highlighted: PropTypes.bool
  })
```

#### `propTypes` is an use case of `map`

The example above is equivalent to:

```js
import PropTypes from 'prop-types'
import { setPropTypes } from 'recompose'

const Title = Html.H1
  .style(({ highlighted }) => ({
    backgroundColor: highlighted ? 'yellow' : 'transparent'
  }))
  .map(setPropTypes({
    children: PropTypes.node,
    highlighted: PropTypes.bool
  }))
```

### style(props => stylesToAdd : Object)

The `style` helper gives a simple way of adding properties to the `style` prop of the target component. It takes a function from props to a style object. The function will be invoked each time with the props. The result will be set as the `style` prop of the wrapper component. If there are styles coming from outside, they will be merged together with the result of this function. For example:

```js
const Title = Html.H1
  .style(props => ({color: highlighted ? 'red' : 'black'}))

render(
  <Title
    highlighted
    style={{backgroundColor: 'green'}}
  />,
  domElement
)
```

The resulting style will be: `{ color: 'red', backgroundColor: 'green' }`.

#### `style` is an use case of `contramap`

```js
.style(({hovered}) => ({
  color: hovered ? 'red' : 'black'
}))
```

…is equivalent to:

```js
.contramap(props => ({
  style: {
    color: props.hovered ? 'red' : 'black',
    ...props.style
  },
  ...props
}))
```

### name(newDisplayName : String)

Sets the `displayName` of the component:

```js
const Tagline = H2.name('Tagline')
```

#### `name` is an use case of `map`

```js
.name('Tagline')
```

…is equivalent to:

```js
import { setDisplayName } from 'recompose'

.map(setDisplayName('Title'))
```

### rotate(props => rotation : number)

`rotate` sets up a style `transform` property with the specified rotation, in degrees. If there is a transform already, `rotate` will append to it:

```js
const Title = Html.H1
  .rotate(props => 45)

render(
  <Title.Component style={{ transform: 'rotate(45deg)' }} />,
  document.getElementById('root')
)
```

…will result in `transform: 'translateX(20px) rotate(45deg)'`

> Just a reminder: rotations start from the top left edge as the axis, which is rarely what one wants. If you want the rotation to happen from the center, you can set `transform-origin: 'center'`, that with ReactDream would be `.style(props => ({transformOrigin: 'center'}))`.

#### `rotate` is an use case of `contramap`

```js
.rotate(props => 45)
```

…is equivalent to:

```js
.contramap(props => ({
  style: {
    transform: props.transform
      ? `${props.transform} rotate(45deg)`
      : 'rotate(45deg)'
    ...props.style
  },
  ...props
}))
```

### scale(props => scaleFactor : number)

`scale` sets up a style `transform` property with the specified scaling factor. If there is a transform already, `scale` will append to it:

```js
const Title = Html.H1
  .scale(props => 1.5)

render(
  <Title.Component style={{ transform: 'scale(1.5)' }} />,
  document.getElementById('root')
)
```

…will result in `transform: 'translateX(20px) scale(1.5)'`

##### `scale` is an use case of `contramap`

```js
.scale(props => 2)
```

…is equivalent to:

```js
.contramap(props => ({
  style: {
    transform: props.transform
      ? `${props.transform} scale(2)`
      : 'scale(2)'
    ...props.style
  },
  ...props
}))
```

### translate(props => [x : number, y : number, z : number])

`translate` allows you to easily set up the `transform` style property with the specified displacement. If there is a transform already, `translate` will append to it:

```js
const Title = Html.H1
  .translate(props => [30])
  .translate(props => [null, 30])
  .translate(props => [null, null, 30])
```

…will result in `transform: 'translateZ(30px) translateY(30px) translateX(30px)'`

#### `translate` is an use case of `contramap`

```js
.translate(({x, y}) => [x, y])
```

…is equivalent to:

```js
.contramap(props => ({
  style: {
    transform: props.transform
      ? `${props.transform} translate(${x}px, ${y}px)`
      :  `translate(${x}px, ${y}px)`
    ...props.style
  },
  ...props
}))
```

## Debugging

The downside of chaining method calls is that debugging is not super intuitive. Since there are no statements, it’s not possible to place a `console.log()` or `debugger` call in the middle of the chain without some overhead. To simplify that, two methods for debugging are bundled:

### log(props => value : any)

Whenever the Component is called with new props, it will print:

- The component displayName
- The value by the argument function. The value can be anything, it will be passed as-is to the `console.log` function.

Pretty useful to debug what exactly is happening in the chain:

```js
const Title = Html.H1
  .log(props => 'what props gets to the H1?')
  .log(props => props)
  .contramap(({hovered, label}) => ({
    children: hovered ? 'Hovered!' : label
  }))
  .log(({label}) => 'is there a label before the contramap? ' + label)
  .name('Title')
  .log(({label}) => 'does it also get a label from outside? ' + label)

render(
  <Title.Component hovered label='Label from outside' />,
  domElement
)
```

`log` will become a no-op when the `NODE_ENV` is `production`.

For more details check out [@hocs/with-log](https://github.com/deepsweet/hocs/tree/master/packages/with-log) documentation which React Dream is using under the hood.

#### `log` is an use case of `map`

```js
.log(({a}) => `a is: ${a}`)
```

…is equivalent to:

```js
import withLog from '@hocs/with-log'

.map(withLog(({a}) => `a is: ${a}`))
```

### debug()

**Careful**: This method allows you to inject a `debugger` statement at that point in the chain. The result will allow you to inspect the Component and its props, from the JavaScript scope of the [@hocs/with-debugger higher-order component](https://github.com/deepsweet/hocs/tree/master/packages/with-debugger).

```js
import React from 'react'
import { render } from 'react-dom'
import { Html } from 'react-dream-web-builtins'

const App = Html.Div
  .debug()
  .removeProps('a', 'c', 'randomProp')
  .addProps(() => ({
    a: '1',
    c: '4'
  }))
```

It will be called on each render of the component.

`debug` will become a no-op when the `NODE_ENV` is `production`.

For more details check out [@hocs/with-debugger](https://github.com/deepsweet/hocs/tree/master/packages/with-debugger) documentation which React Dream is using under the hood.

#### `debug` is an use case of `map`

```js
.debug()
```

…is equivalent to:

```js
import withDebugger from '@hocs/with-debugger'

.map(withDebugger)
```

## Built-in Primitives

A separate package, [react-dream-web-builtins](https://github.com/xaviervia/react-dream-web-builtins) ships with a complete set of HTML and SVG primitives lifted into the type. You can access them like:

```js
import { Svg, Html } from 'react-dream-web-builtins'

const MyDiv = Html.Div

const MyLayer = Svg.G
```

Read more in the package [README]((https://github.com/xaviervia/react-dream-web-builtins))

## License

[MIT](LICENSE)

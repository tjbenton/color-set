import tinycolor from 'tinycolor2'


export function colorSet (colors, inputOptions = {}) {
  // holds the light and dark functions to use for the different variations.
  // (only light, and dark can be the keys of this map)
  const options = {
    // this is a fall back increment if the color functions that are defined are lists
    // and not maps
    increment: 10,
    // determines how far you go back if the color is #fff or #000 (example if you called
    // color(#ccc, 25) that will be black but if smart color is set then it will be #060606)
    smartColor: 0.5,
    ...inputOptions,
  }

  Object.assign(colors, {
    white: colors.white || '#fff',
    black: colors.black || '#000',
  })

  // loop through the colors and ensure the config is consistent
  Object.keys(colors).forEach((color) => {
    let value = colors[color]
    if (typeof value === 'string') {
      value = { 0: value }
    }
    Object.assign(colors, { [color]: value })
  })

  const getIncrement = (variation) => {
    const variationFloor = Math.floor(Math.abs(variation))
    const variationRemainder = Math.abs(variation) - variationFloor

    // gets the current increment
    let increment = variationFloor * options.increment

    // this handles the decimal values for variations
    if (variationRemainder > 0) {
      increment += variationRemainder * options.increment
    }

    return increment
  }

  // ratio can be between -100.00 and 100.00
  // @todo refactor and simplify
  /* eslint-disable-next-line max-params, complexity */
  const fn = (inputColor, variation = 0, inputForce = false, inputSave = true) => {
    const originalColor = inputColor
    let color = inputColor
    let force = inputForce
    let save = inputSave

    let cache
    if (!color) {
      throw new Error('you must pass in a color or a color key')
    }
    const isValid = tinycolor(color).isValid() && tinycolor(color).getFormat() !== 'name'

    if (!colors[color] && !isValid) {
      throw new Error(`${color} was not defined in colorSet, or wasn't a color`)
    }

    // if a valid color was passed then force it to be calculated
    // and don't save the results
    if (isValid) {
      force = true
      save = false
    } else {
      cache = colors[color]
      color = cache['0']
      // get the base color to work with
      // ;({ 0: color } = color)
    }

    // try to get the stored color value
    if (!force && cache[variation]) {
      return cache[variation]
    }

    color = tinycolor(color)

    {
      const increment = getIncrement(variation)
      // determine which way to modify the color
      const type = variation > 0 ? 'darken' : 'lighten'
      const modifier = variation > 0 ? '#000' : '#fff'
      const quarter = increment / 4
      color = tinycolor.mix(color[type](quarter).toHexString(), modifier, quarter * 3)
    }

    // if smart color is true and the result is black or white then return the darker or lighter
    // version of this color
    if (options.smartColor && [ 'ffffff', '000000' ].includes(color.toHex())) {
      const modifier = color.toHex() === 'ffffff' ? options.smartColor : options.smartColor * -1
      return fn(originalColor, variation + modifier)
    }

    color = color.toHexString()

    // if save is true then cache the color value
    if (save) {
      cache[variation] = color
    }

    return color
  }

  fn.colors = colors

  return fn
}

export const color = (...args) => color?.fn(...args)

color.set = (colors) => {
  color.fn = colorSet(colors)
}

color.rgba = (colorValue, alpha = 1) => {
  return tinycolor(colorValue)
    .setAlpha(alpha)
    .toHex8String()
}

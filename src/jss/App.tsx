import { Config } from '../definitions/config'
import jss from 'jss'
const color = require('color')
// @ts-ignore
import camelCase from 'jss-camel-case'
// @ts-ignore
import nested from 'jss-nested'

// @ts-ignore
jss.use(camelCase(), nested())

export default (config: Config) => {
  const styles = {
    socialbot: {
      transition: 'opacity 0.2s ease',
      '& div, img, span': {
        all: 'unset',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        direction: 'ltr',
        boxSizing: 'border-box',
        fontFamily: config.theme === 'material' ? `'Roboto', sans-serif` : ''
      },
      '& img': {
        WebkitUserDrag: 'none',
        KhtmlUserDrag: 'none',
        MozUserDrag: 'none',
        OUserDrag: 'none',
      },
      '&.fade-out': {
        opacity: 0,
        pointerEvents: 'none'
      },
      '&.disable-input': {
        display: 'none'
      }
    },
    '@import': config.theme === 'material' && `url('https://fonts.googleapis.com/css?family=Roboto:400,500')`
  }
  // @ts-ignore
  return jss.createStyleSheet(styles, {increaseSpecificity: false}).attach().classes
}

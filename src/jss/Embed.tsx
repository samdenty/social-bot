import { Config } from '../definitions/config'
import jss from 'jss'
const color = require('color')
// @ts-ignore
import camelCase from 'jss-camel-case'
// @ts-ignore
import nested from 'jss-nested'
// @ts-ignore
import increaseSpecificity from 'jss-increase-specificity'

// @ts-ignore
jss.use(camelCase(), nested(), increaseSpecificity())

export default (config: Config) => {
  const mobileStyle = {
    'popup': {
      top: '0 !important',
      bottom: '0 !important',
      left: '0 !important',
      right: '0 !important',
      height: 'initial !important',
      maxHeight: 'initial !important',
      width: '100% !important',
      maxWidth: 'initial !important',
      borderRadius: '0 !important'
    },
    'iframe': {
      borderRadius: '0 !important'
    }
  }
  const styles = {
    'popup': {
      zIndex: '2147483000 !important',
      position: 'fixed !important',
      [config.position[1]]: '20px !important',
      height: 'calc(100% - 20px - 75px - 20px) !important',
      [config.position[0]]: 'calc(20px + 75px) !important',
      backgroundColor: `${config.scheme === 'dark' ? '#36393E' : '#FFFFFF'} !important`,
      width: '370px !important',
      minHeight: '250px !important',
      maxHeight: '590px !important',
      borderRadius: '8px !important',
      overflow: 'hidden !important',
      opacity: '0 !important',
      pointerEvents: 'none',
      transition: 'opacity .2s ease, transform .1s ease',
      transform: 'translate(0, 5px) !important',
      WebkitTouchCallout: 'none !important',
      WebkitUserSelect: 'none !important',
      KhtmlUserSelect: 'none !important',
      MozUserSelect: 'none !important',
      MsUserSelect: 'none !important',
      userSelect: 'none !important',
      display: 'none !important'
    },
    'popup-block': {
      display: 'block !important'
    },
    'popup-open': {
      boxShadow: '0 5px 40px rgba(0,0,0,0.3) !important',
      opacity: '1 !important',
      pointerEvents: 'initial !important',
      transform: 'translate(0) !important',
    },
    'iframe': {
      position: 'absolute !important',
      borderRadius: '8px !important',
      top: '0 !important',
      left: '0 !important',
      width: '100% !important',
      height: '100% !important',
      border: '0 !important',
    },
    'loading-svg': {
      position: 'absolute !important',
      width: '100px !important',
      height: '100px !important',
      top: '50% !important',
      left: '50% !important',
      transform: 'translate(-50%, -50%) scale(0.6) !important',
      '& .double-bounce1, .double-bounce2': {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: config.scheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
        opacity: '0.6',
        position: 'absolute',
        top: '0',
        left: '0',
        animation: 'bounce 2.0s infinite ease-in-out'
      },
      '& .double-bounce2': {
        animationDelay: '-1.0s'
      },
    },
    '@keyframes bounce': {
      '0%, 100%': {
        transform: 'scale(0.0)',
        webkitTransform: 'scale(0.0)'
      },
      '50%': {
        transform: 'scale(1.0)',
        webkitTransform: 'scale(1.0)'
      }
    },
    [`@media screen and (max-width: ${config.mobile.maxWidth}px)`]: {
      ...mobileStyle
    },
    [`@media screen and (max-height: ${config.mobile.maxHeight}px)`]: {
      ...mobileStyle
    },
  }

  return jss.createStyleSheet(styles).attach().classes
}

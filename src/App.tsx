declare var window: any
import { Config } from './definitions/config'
import { Notifications } from './definitions/notifications'
import * as ReactDOM from 'react-dom'
import * as React from 'react'

import { Renderer } from './Renderer'
import DeepMerge from './components/DeepMerge'
import ParseConfig from './components/Config'
import log from './components/Log'
// @ts-ignore
import * as load from 'load-script'
import jss from './jss/App'

let path = document.currentScript.getAttribute('src').split('?')[0]
let relative = path.split('/').slice(0, -1).join('/')+'/'

// SocialBot sandbox
let global = (window.globalSocialBot = {
  insertionPoint: document.createElement('div'),
  sessions: 0,
  modules: {}
})
global.insertionPoint.classList.add('socialbot')
// Wait for the DOM to load before inserting
if (document.body) {
  document.body.appendChild(global.insertionPoint)
} else {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(global.insertionPoint)
  })
}

/**
 * Due to React trying enforcing a "strict" state handler,
 * all states for SocialBot are manually handled in a class that
 * doesn't extend React.Component; This results in a speed
 * increase and the ability to recreate the live-state
 * to scripts outside the React Renderer class.
 */
class StateHandler {
  state = {
    view: {
      opened: false,
      open: false,
      loading: true,
    },
    /**
     * Default configuration
     */
    config: {
      debug: false,

      icon: null,
      size: '50% 50%',
      theme: 'material',
      color: '#7289DA',

      notifications: {
        indicator: {
          enable: true
        },
        toasts: {
          enable: true,
          visibilityTime: 10,
          maxMessages: 5,
          maxHeight: 'calc(70% - 100px)'
        }
      },

      mobile: {
        maxWidth: 500,
        maxHeight: 500
      },

      position: ['bottom', 'right'],

      delay: false,
      disable: []
    },
    notifications: {
      unread: 0,
      pinged: false,
      messages: []
    },
    classes: {},
    iframe: null
  }
  react: any
  node: any
  visibilityTimer: any
  eventListeners = {}
  allEventListeners = []

  constructor(config) {
    if (!window.socialbot) {
      window.socialbot = this
    }
    ParseConfig(this.state, config)
      .then((config) => {
        this.setState({
          classes: jss(config),
          config: config
        })

        if (!config.delay) {
          setTimeout(() => {
            this.setState({
              view: {
                ...this.state.view,
                opened: true
              }
            })
          }, 3000)
        }

        // Mount DOM node
        this.node = document.createElement('div')
        this.node.classList.add(`socialbot-${global.sessions}`)
        global.insertionPoint.appendChild(this.node)
        global.sessions++
        ReactDOM.render(
          // @ts-ignore custom state handler
          <Renderer
            api={this}
            ref={(renderer) => {
              this.react = renderer
            }}
          />,
          this.node
        )
      })
      .catch((error) => {
        log(
          'error',
          `Invalid configuration!\n${error}\n\nrefer to https://docs.widgetbot.io`
        )
      })
  }

  // Custom state handler
  setState(nextState: any) {
    Object.keys(nextState).forEach((state) => {
      // Force JSS re-render
      if (
        nextState &&
        nextState.config &&
        JSON.stringify(nextState.config) !== JSON.stringify(this.state.config)
      ) {
        this.config(nextState.config, true)
      }
      this.state[state] = nextState[state]
    })
    // Force re-render of the renderer
    if (this.react) this.react.forceUpdate()
  }

  // Deep merges the new config with the current config
  config(config: any, programmatic?: boolean) {
    ParseConfig(this.state, config)
      .then((config) => {
        this.setState({
          classes: jss(config),
          config: config
        })
      })
      .catch((error) => {
        log(
          'error',
          `Invalid configuration!\n${error}\n\nrefer to https://docs.widgetbot.io`
        )
      })
  }
}

/**
 * Group APIs under this class
 */
class Core extends StateHandler {
  toggle(open?: boolean) {
    open = typeof open === 'boolean' ? open : !this.state.view.open
    this.setState({
      view: {
        ...this.state.view,
        open: open,
        opened: true
      },
      notifications: {
        unread: 0,
        pinged: false,
        messages: []
      }
    })

    /**
     * Stop the body from scrolling
     */
    if (
      window.innerWidth <= this.state.config.mobile.maxWidth ||
      window.innerHeight <= this.state.config.mobile.maxHeight
    ) {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    /**
     * Add the meta tag, for chrome header color
     */
    ;(() => {
      let meta: HTMLMetaElement = document.querySelector(
        'meta[name=theme-color]'
      )
      if (meta) {
        if (meta.getAttribute('default') === null) {
          meta.setAttribute('default', meta.content || '')
        }
      } else {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'theme-color')
        meta.setAttribute('default', '')
        document.head.appendChild(meta)
      }
      /**
       * Timeout so the transition fades with the chrome header
       */
      setTimeout(() => {
        if (open) {
          let color =
            this.state.config.color ||
            this.state.config['scheme'] === 'light'
              ? '#ffffff'
              : '#36393E'
          meta.setAttribute('content', color)
        } else {
          meta.setAttribute('content', meta.getAttribute('default'))
        }
      }, 100)
    })()

    this.event('toggle', open)
  }

  show() {
    clearTimeout(this.visibilityTimer)
    this.node.firstChild.classList.remove('disable-input')
    this.visibilityTimer = setTimeout(() => {
      this.node.firstChild.classList.remove('fade-out')
    }, 10)

    this.event('visibility', true)
  }

  hide() {
    clearTimeout(this.visibilityTimer)
    this.node.firstChild.classList.add('fade-out')
    this.visibilityTimer = setTimeout(() => {
      this.node.firstChild.classList.add('disable-input')
    }, 200)

    this.event('visibility', false)
  }

  pulse(pulsing: boolean = !this.state.notifications.pinged) {
    this.setState({
      notifications: {
        ...this.state.notifications,
        pinged: pulsing
      }
    })
    this.event('pulse', pulsing)
  }

  message(
    message: string,
    visibility: number,
    avatar: string = 'https://beta.widgetbot.io/embed/335391242248519680/335391242248519680/0002/default.webp'
  ) {
    let { unread, pinged, messages } = this.state.notifications

    let expiration
    if (typeof visibility !== 'undefined') {
      if (typeof visibility === 'number') {
        expiration = +new Date() + visibility
      } else if (typeof visibility === 'boolean') {
        expiration = false
      } else {
        throw new Error(
          'Expected parameter two to be of type number | boolean!'
        )
      }
    } else {
      let time = this.state.config.notifications.toasts.visibilityTime
      if (time < 1) time = 15
      expiration = +new Date() + 1000 * time
    }

    if (
      this.state.config.notifications.indicator.enable &&
      !this.state.view.open
    )
      unread++

    // Push to start of array
    messages.unshift({
      expiration,
      message: {
        author: {
          avatar
        },
        id:
          Math.floor(Math.pow(10, 15) + Math.random() * 9 * Math.pow(10, 15)) +
          +new Date(),
        content: message,
        fake: true
      }
    })
    messages = messages.slice(
      0,
      this.state.config.notifications.toasts.maxMessages
    )

    this.setState({
      notifications: {
        ...this.state.notifications,
        unread,
        messages
      }
    })
  }

  remove() {
    ReactDOM.unmountComponentAtNode(this.node)
    global.insertionPoint.removeChild(this.node)
  }

  /**
   * SocialBot listeners API
   */

  on(eventName: string, callback: Function) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = []
    }
    this.eventListeners[eventName].push(callback)
  }

  onEvent(callback: Function) {
    this.allEventListeners.push(callback)
  }

  event(name: string, data?: any) {
    if (this.eventListeners[name]) {
      for (let listener of this.eventListeners[name]) {
        // Async to prevent blocking
        setTimeout(() => {
          listener(data)
        })
      }
    }
    for (let listener of this.allEventListeners) {
      // Async to prevent blocking
      setTimeout(() => {
        listener(name, data)
      })
    }
  }
}

window.SocialBot = class {
  load(name: string, callback: Function) {
    name = name.toLowerCase()
    if (global.modules[name]) {
      callback(global.modules[name])
    } else {
      load(relative + name + '.js', (err, script) => {
        if (err) {
          // print useful message
        } else {
          callback(global.modules[name])
        }
      })
    }
  }

  constructor(type: string, config: Config, callback?: Function) {
    this.load(type, Module => {
      if (typeof callback === 'function') {
        callback(new Module(config))
      }
    })
  }

  static Core = Core
}

// Load crate from inside script tag
;(() => {
  let config = document.currentScript && document.currentScript.innerHTML
  if (config) {
    eval(config)
  }
})()

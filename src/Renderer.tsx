declare var window: any
import * as React from 'react'

import { Config } from './definitions/config'
import { View } from './definitions/view'
import { Notifications } from './definitions/notifications'

import log from './components/Log'
import { Embed } from './components/Embed'
import { Toggle } from './components/Toggle'
import { Toasts } from './components/Toasts'

function contains(a, obj) {
  var i = a.length;
  while (i--) {
     if (a[i] === obj) {
         return true;
     }
  }
  return false;
}

export class Renderer extends React.Component<{ api: any }> {
  state = this.props.api.state
  classes = this.props.api.state.classes
  postMessage = this.props.api.postMessage
  transition = this.props.api.transition
  eventListeners = this.props.api.eventListeners
  allEventListeners = this.props.api.allEventListeners

  render() {
    let { classes } = this.state
    let config: Config = this.state.config
    let { api } = this.props

    return classes ? (
      <div className={`crate ${classes.crate}`}>
        {!contains(config.disable, 'embed') && <Embed
          view={this.state.view}
          event={api.event.bind(this)}
          config={this.state.config}
          setIframe={(iframe) => (this.state.iframe = iframe)}
        />}

        {!contains(config.disable, 'toggle') && <Toggle
          view={this.state.view}
          event={api.event.bind(this)}
          config={this.state.config}
          toggle={api.toggle.bind(this)}
          notifications={this.state.notifications}
        />}

        {!contains(config.disable, 'toasts') && config.notifications.toasts.enable &&
          !this.state.view.open && (
            <Toasts
              view={this.state.view}
              event={api.event.bind(this)}
              config={this.state.config}
              openUser={api.user.bind(this)}
              expand={api.expandMessage.bind(this)}
              messages={this.state.notifications.messages}
              crateEvent={api.crateEvent.bind(this)}
            />
          )}
      </div>
    ) : (
      <div />
    )
  }

  setState(state) {
    // @ts-ignore custom state handler
    let { api } = this.props
    api.setState(state)
  }

  event = this.props.api.event.bind(this)
  crateEvent = this.props.api.crateEvent.bind(this)
}

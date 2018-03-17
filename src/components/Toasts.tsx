declare var window: any
import * as React from 'react'
import { Config } from '../definitions/config'
import { View } from '../definitions/view'
import { Notifications } from '../definitions/notifications'
import jss from '../jss/Toasts'
const { toHTML: parse } = require('markdown').markdown

interface Props extends View {
  messages: any
  event: Function
}

export class Toasts extends React.Component<Props, {}> {
  classes: any

  componentWillMount() {
    let { config } = this.props
    this.classes = jss(config)
  }

  componentWillReceiveProps(nextProps: Props) {
    // Force JSS re-render
    if (
      nextProps &&
      JSON.stringify(nextProps.config) !== JSON.stringify(this.props.config)
    ) {
      this.classes = jss(nextProps.config)
      this.forceUpdate()
    }
  }

  render() {
    let {
      messages,
      event
    }: {
      messages: { expiration: number; message: Notifications.message }[]
      event: Function
    } = this.props
    let { classes } = this
    return (
      <div className={`socialbot-toast-box ${classes['toast-box']}`}>
        {/* Reversing the message array and use column-reverse to prevent the need for scrolling */}
        {messages.map(({ expiration, message }, i: number) => {
          return (
            <Toast
              message={message}
              expiration={expiration}
              key={message.id}
              classes={classes}
              last={i === 0}
              config={this.props.config}
              event={event.bind(this)}
            />
          )
        })}
      </div>
    )
  }
}

interface ToastProps {
  message: Notifications.message
  expiration: number
  classes: any
  last: boolean
  config: Config
  event: Function
}

class Toast extends React.Component<ToastProps, {}> {
  state = {
    render: true
  }
  toast: HTMLElement
  mounted = true

  componentWillMount() {
    let { expiration } = this.props
    /**
     * Prevent rendering of already expired messages
     */
    if (expiration && +new Date() > expiration) {
      this.setState({
        render: false
      })
    }
  }

  componentDidMount() {
    let { last, classes, expiration } = this.props

    if (last) {
      setTimeout(() => {
        this.show()
      }, 10)
      if (expiration) this.expirationChecker()
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  show() {
    if (this.mounted && this.toast) {
      let { classes } = this.props
      this.toast.classList.add(classes['toast-visible'])
    }
  }

  hide() {
    if (this.mounted && this.toast) {
      let { classes } = this.props
      this.toast.classList.remove(classes['toast-visible'])
      this.toast.classList.add(classes['toast-hidden'])
    }
  }

  expirationChecker() {
    if (this.mounted && this.toast) {
      let { expiration } = this.props
      if (+new Date() > expiration) {
        this.hide()
        setTimeout(() => {
          this.setState({
            render: false
          })
        }, 400)
      } else {
        setTimeout(() => this.expirationChecker(), 500)
      }
    }
  }

  render() {
    let { message, classes, config, event, last, expiration } = this.props
    return this.state.render ? (
      <div
        className={`socialbot-toast ${classes.toast} ${
          last ? classes['toast-hidden'] : ''
        }`}
        ref={(toast) => (this.toast = toast)}>
        <img
          src={
            message.author.avatar ||
            config.avatar
          }
          className={`socialbot-toast-avatar ${classes['toast-avatar']}`}
        />
        <div className={`socialbot-toast-message ${classes['toast-message']}`}>
          <div
            className={`socialbot-toast-content ${classes['toast-content']}`}
            dangerouslySetInnerHTML={{ __html: message.content ? parse(message.content) : '' }}
            onClick={() => event('message-click', message)}
          />
        </div>
      </div>
    ) : (
      <div />
    )
  }
}

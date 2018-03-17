import * as React from 'react'
import { View } from '../definitions/view'
import jss from '../jss/Embed'
// @ts-ignore
import Measure from 'react-measure'

interface Props extends View {
  setIframe: Function
}

export class Embed extends React.Component<Props, {}> {
  state = {
    block: false,
    opacity: true,
    dimensions: {
      width: -1,
      height: -1
    }
  }
  classes: any
  timeout: any

  componentWillMount() {
    let { config, view } = this.props
    this.classes = jss(config)
    this.setState({
      block: view.open,
      opacity: view.open
    })
  }

  componentWillReceiveProps(nextProps: Props) {
    /**
     * Overcomes the issue of display: none preventing transitions
     */
    let { view } = nextProps
    if (view.open !== this.state.block || view.open !== this.state.opacity) {
      clearTimeout(this.timeout)
      if (view.open === true) {
        // Opened
        this.setState({
          block: true
        })
        setTimeout(() => {
          this.setState({
            opacity: true
          })
        }, 0)
      } else {
        // Closed
        this.setState({
          opacity: false
        })
        this.timeout = setTimeout(() => {
          this.setState({
            block: false
          })
        }, 250)
      }
    }
    if (
      nextProps &&
      JSON.stringify(nextProps.config) !== JSON.stringify(this.props.config)
    ) {
      this.classes = jss(nextProps.config)
      this.forceUpdate()
    }
  }

  render() {
    const { width, height } = this.state.dimensions
    let { view, config } = this.props
    let { classes } = this
    return (
      <div
        className={`socialbot-popup ${classes.popup} ${
          this.state.block ? classes['popup-block'] : ``
        } ${this.state.opacity ? classes['popup-open'] : ``}`}>
        {view.loading && (
          <div className={classes['loading-svg']}>
            <div className="double-bounce1" />
            <div className="double-bounce2" />
          </div>
        )}
        <Measure
          bounds
          onResize={(contentRect) => {
            this.setState({ dimensions: contentRect.bounds })
          }}>
          {({ measureRef }) => (
            <React.Fragment>
              {view.opened && (
                <iframe
                  className={classes.iframe}
                  src={`${config.url}&width=${this.state.dimensions.width}&height=${this.state.dimensions.height}`}
                  srcDoc={config.html ? `<style>body{margin:0}</style>${config.html}` : null}
                  ref={(iframe) => {
                    this.props.setIframe(iframe)
                    measureRef(iframe)
                  }}
                />
              )}
            </React.Fragment>
          )}
        </Measure>
      </div>
    )
  }
}

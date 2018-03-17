import { Url } from "url"

export interface Config {
  /**
   * Aesthetic options
   */
  icon?: Url
  size?: string
  scheme?: 'dark' | 'light'     // Whether to show dark or light toasts
  theme?: 'material'            // Toggle button style
  color: string

  position: [('top' | 'bottom'), ('left' | 'right')]
  mobile?: {
    maxWidth?: number           // The screen resolution at which the mobile version should be used
    maxHeight?: number          // The screen resolution at which the mobile version should be used
  }

  /**
   * Notifications
   */
  notifications?: {
    indicator?: {
      enable: boolean
    }
    toasts?: {
      enable: boolean           // Whether to enable toasts or not
      visibilityTime?: number   // Max amount of time the toasts should be visible for (set to 0 to disable timeout)
      maxMessages?: number      // Max amount of messages to display on screen
      maxHeight?: string        // Max height of the toast container, CSS `calc()` can be used
    }
  }
  avatar: string                // Default avatar

  /**
   * General options
   */
  delay?: boolean               // Only load the widget once the button has been clicked
  debug?: boolean               // Debug socialbot
  disable?: ('toggle' | 'toasts' | 'embed')[] // Disable components
}

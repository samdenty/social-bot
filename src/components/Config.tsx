import { Config } from '../definitions/config'
import DeepMerge from './DeepMerge'

/**
 * Resolves a valid configuration object, inheriting properties
 * that are undefined from the default configuration
 */
export default (state: any, config: Config) => {
  return new Promise<Config>((resolve: Function, reject: Function) => {
    /**
     * Parse the configuration
     */
    if (typeof config === 'object') {
      config = DeepMerge(state.config, config)

      if (!/^material$/.test(config.theme)) {
        return reject(`config.theme equals "${config.theme}" but it can only equal "material"`)
      }

      if (!(config.position[0] == 'top' || config.position[0] == 'bottom')) {
        return reject(`config.position[0] equals "${config.position[0]}" but it can only equal "top" or "bottom"! you likely mixed up your axes`)
      }

      if (!(config.position[1] === 'left' || config.position[1] == 'right')) {
        return reject(`config.position[1] equals "${config.position[1]}" but it can only equal "left" or "right"! you likely mixed up your axes`)
      }

      resolve(config)
    } else {
      reject(`"config" should be of type Object`)
    }
  })
}

export function queryString(object: any) {
  let query = []
  for (var p in object)
    if (object.hasOwnProperty(p)) {
      query.push(`${encodeURIComponent(p)}=${encodeURIComponent(object[p])}`)
    }
  return `?${query.join("&")}`
}

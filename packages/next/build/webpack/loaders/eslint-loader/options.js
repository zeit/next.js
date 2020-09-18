export default {
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "cache": {
      "description": "This option will enable caching of the linting results into a file. This is particularly useful in reducing linting time when doing a full build.",
      "anyOf": [{ "type": "boolean" }, { "type": "string" }]
    },
    "eslintPath": {
      "description": "Path to `eslint` instance that will be used for linting. If the `eslintPath` is a folder like a official eslint, or specify a `formatter` option. now you dont have to install `eslint` .",
      "type": "string"
    },
    "formatter": {
      "description": "Loader accepts a function that will have one argument: an array of eslint messages (object). The function must return the output as a string.",
      "anyOf": [{ "type": "string" }, { "instanceof": "Function" }]
    },
    "emitError": {
      "description": "Loader will always return errors if this option is set to `true`.",
      "type": "boolean"
    },
    "emitWarning": {
      "description": "Loader will always return warnings if option is set to `true`. If you're using hot module replacement, you may wish to enable this in development, or else updates will be skipped when there's an eslint error.",
      "type": "boolean"
    },
    "failOnError": {
      "description": "Loader will cause the module build to fail if there are any eslint errors.",
      "type": "boolean"
    },
    "failOnWarning": {
      "description": "Loader will cause the module build to fail if there are any eslint warnings.",
      "type": "boolean"
    },
    "quiet": {
      "description": "Loader will process and report errors only and ignore warnings if this option is set to true",
      "type": "boolean"
    },
    "outputReport": {
      "description": "Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI",
      "anyOf": [
        {
          "type": "boolean"
        },
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "filePath": {
              "description": "The `filePath` is relative to the webpack config: output.path",
              "anyOf": [{ "type": "string" }]
            },
            "formatter": {
              "description": "You can pass in a different formatter for the output file, if none is passed in the default/configured formatter will be used",
              "anyOf": [{ "type": "string" }, { "instanceof": "Function" }]
            }
          }
        }
      ]
    }
  }
}

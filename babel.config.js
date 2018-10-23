const getPresets = modules => [
  ["@babel/preset-env", { useBuiltIns: "usage", modules }],
  "@babel/preset-react",
]

module.exports = {
  presets: getPresets(false),
  plugins: [
    // stage-1
    "@babel/plugin-proposal-optional-chaining",

    // stage-2
    ["@babel/plugin-proposal-decorators", { legacy: true }],

    // stage-3
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ],
  env: {
    production: {
      plugins: [
        [
          "lodash",
          { id: ["lodash", "@material-ui/core", "@material-ui/icons"] },
        ],
      ],
    },
    test: {
      presets: getPresets(),
    },
  },
}

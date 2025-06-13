/* eslint-env node */

const { configure } = require("quasar/wrappers")

module.exports = configure((ctx) => ({
  supportTS: false,

  boot: ["axios", "socket", "auth"],

  css: ["app.scss"],

  extras: ["roboto-font", "material-icons", "material-icons-outlined", "mdi-v7"],

  build: {
    vueRouterMode: "history",
    env: {
      API_URL: ctx.dev ? "http://localhost:8000/api" : "https://api.ojoahi.com/api",
      SOCKET_URL: ctx.dev ? "http://localhost:8000" : "https://api.ojoahi.com",
    },
  },

  devServer: {
    open: true,
    port: 9000,
  },

  framework: {
    config: {
      notify: {
        position: "top-right",
        timeout: 2500,
      },
      loading: {
        spinnerColor: "primary",
        spinnerSize: 140,
      },
    },

    plugins: ["Notify", "Dialog", "Loading", "LocalStorage", "SessionStorage"],
    components: [
    'QInnerLoading',
    'QSpinnerDots'
  ]
  },

  animations: "all",

  ssr: {
    pwa: false,
    prodPort: 3000,
    middlewares: ["render"],
  },

  pwa: {
    workboxMode: "generateSW",
    injectPwaMetaTags: true,
    swFilename: "sw.js",
    manifestFilename: "manifest.json",
    useCredentialsForManifestTag: false,
  },

  cordova: {},

  capacitor: {
    hideSplashscreen: true,
  },

  electron: {
    inspectPort: 5858,
    bundler: "packager",
    packager: {},
    builder: {
      appId: "com.ojoahi.app",
    },
  },

  bex: {
    contentScripts: ["content-script"],
  },
}))

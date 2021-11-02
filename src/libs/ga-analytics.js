const ReactGA = require("react-ga");

const TRACKING_ID = "G-DECWT3BZW"

function init() {
  // Enable debug mode on the local development environment
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development"
  ReactGA.initialize(TRACKING_ID, { debug: isDev })
}

function sendEvent(payload) {
  ReactGA.event(payload);
}

function sendPageview(path) {
  ReactGA.set({ page: path })
  ReactGA.pageview(path);
}

function sendModalview(path) {
  ReactGA.modalview(path);
}

function sendTwitterShare(link_display) {
  ReactGA.ga('send', 'social', 'Twitter', 'tweet', link_display);
}

function sendTwitterOriginal(link_display) {
  ReactGA.ga('send', 'social', 'Twitter', 'open', link_display);
}

module.exports = {
  init,
  sendEvent,
  sendPageview,
  sendModalview,
  sendTwitterShare,
  sendTwitterOriginal
}

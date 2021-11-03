import ReactGA from "react-ga4"

const TRACKING_ID = "G-DECWT3BZW"

function init() {
  // Enable debug mode on the local development environment
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development"
  ReactGA.initialize(TRACKING_ID, { debug: isDev })
}

function sendEvent(payload) {
  ReactGA.event({...payload, nonInteraction: false});
}

function sendPageview(path) {
  ReactGA.send({ hitType: "pageview", page: path });
}

// Reference https://developers.google.com/gtagjs/reference/event#page_view
function sendShareOnTwitter(link_display) {
  ReactGA.event({ category: 'Twitter', action: 'share', label: link_display, value: 30, nonInteraction: false });
}

function sendOpenOriginalTweet(link_display) {
  ReactGA.event({ category: 'Twitter', action: 'open', label: link_display, value: 10, nonInteraction: true });
}

module.exports = {
  init,
  sendEvent,
  sendPageview,
  sendShareOnTwitter,
  sendOpenOriginalTweet
}

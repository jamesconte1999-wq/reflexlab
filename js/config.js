/*
 * ReactMeter configuration.
 * Everything monetization- and branding-related is plugged in here,
 * so you never have to touch game code to start earning.
 */
window.RLCONFIG = {
  siteName: "ReactMeter",
  tagline: "Test your reflexes. Train your brain. Beat the world.",

  // Used for share links. Update again if you connect a custom domain.
  baseUrl: "https://reactmeter.com",

  // ---- Google AdSense ----------------------------------------------------
  // 1) Get approved at https://adsense.google.com (needs a real domain).
  // 2) Paste your client id below, e.g. "ca-pub-1234567890123456".
  // 3) Create one "Display" ad unit and paste its slot id.
  // 4) Update ads.txt in the site root (instructions inside that file).
  // Until configured, ad slots show a tasteful "share the site" house card.
  adsense: {
    client: "",
    slotDisplay: ""
  },

  // ---- Analytics (optional, pick one) ------------------------------------
  analytics: {
    plausibleDomain: "",   // e.g. "reactmeter.com" if you use plausible.io
    gaMeasurementId: ""    // e.g. "G-XXXXXXXXXX" for Google Analytics 4
  },

  // ---- Extra revenue hooks ------------------------------------------------
  donateUrl: "",   // e.g. "https://buymeacoffee.com/yourname"
  premiumUrl: "",  // e.g. a Stripe Payment Link for an ad-free "Pro" tier

  // ---- Affiliate gear (shown on result screens) ---------------------------
  // The audience of this site is gamers measuring reaction/aim/typing speed:
  // a perfect fit for mouse/keyboard affiliate links (Amazon Associates etc.)
  // Add entries like:
  // { name: "Ultralight gaming mouse", note: "Sub-60 g, 8K polling rate",
  //   url: "https://www.amazon.com/dp/XXXXXXXX?tag=YOURTAG-20" }
  // Leave the array empty to hide the gear card entirely.
  affiliates: []
};

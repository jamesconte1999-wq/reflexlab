# ReactMeter

Eight free brain and reflex benchmarks - reaction time, aim, typing speed and
five memory tests - built as a pure static site. No backend, no build step,
no dependencies. Hosting costs $0, which means every dollar it earns is profit.

**Why this niche is monetizable:** benchmark tests ("reaction time test",
"chimp test", "typing test") get millions of evergreen searches every month,
visitors retry tests repeatedly (lots of pageviews per visit), results are
natively shareable ("beat my score"), and the audience - gamers - is a perfect
match for gaming-gear affiliate revenue. The biggest site in this niche gets
about 5M visits/month on ads alone.

## Run it locally

Any static server works. From the project root:

```powershell
# option 1 (Python)
python -m http.server 8123

# option 2 (Node)
npx serve -l 8123
```

Then open http://localhost:8123. (Opening index.html directly with file://
breaks the folder-style links - use a server.)

## Deploy for free (5 minutes)

Pick any one:

- **Cloudflare Pages / Netlify / Vercel** - connect the GitHub repo, framework
  preset "None", output directory `/`. Done.
- **Netlify drag-and-drop** - drag the project folder onto app.netlify.com/drop.
- **GitHub Pages** - repo Settings > Pages > deploy from branch. Relative links
  are used everywhere, so it works under a project subpath too.

Then:

1. Buy a domain (~$10/yr). Short and brandable, e.g. `reactmeter.com`,
   `neurorush.com`, whatever is free - the site name is easy to change
   (search-and-replace "ReactMeter" plus `siteName` in `js/config.js`).
2. Point the domain at your host.
3. Replace `reactmeter.com` with your domain in `robots.txt` and
   `sitemap.xml`, and set `baseUrl` in `js/config.js`.
4. Submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

## Monetization playbook

Everything plugs into `js/config.js` - you never need to touch game code.

### 1. Display ads - Google AdSense (main revenue)

1. Apply at [adsense.google.com](https://adsense.google.com) with your live
   domain. The site already has what reviewers look for: original text content
   on every page, a privacy policy, an about page, and clean navigation.
2. Once approved, put your `ca-pub-...` id into `adsense.client` and a display
   ad unit id into `adsense.slotDisplay` in `js/config.js`.
3. Update `ads.txt` with your publisher id (instructions inside the file).

Every page already has ad slots placed below the game (never inside it, which
keeps sessions long). Until AdSense is configured the slots show a "share this
site" house card instead, so the layout never looks broken.

Realistic expectations: gaming-niche RPM is roughly $1-5 per 1,000 pageviews.
Traffic is the whole game - see the growth section.

### 2. Affiliate gear (highest RPM per click)

People who test their reaction time and aim are gamers researching gear.
Sign up for Amazon Associates (or a gaming retailer's program), then add
products to `affiliates` in `js/config.js`:

```js
affiliates: [
  { name: "Ultralight gaming mouse", note: "Sub-60 g, the meta for aim",
    url: "https://www.amazon.com/dp/XXXXXXXX?tag=YOURTAG-20" },
  { name: "Mechanical keyboard", note: "For that typing-test PB",
    url: "https://www.amazon.com/dp/XXXXXXXX?tag=YOURTAG-20" }
]
```

A "Level up your gear" card then appears on every result screen - the highest
purchase-intent moment on the site. Disclosure text is included automatically
(required by the FTC and by Amazon's terms).

### 3. Donations / Pro (optional)

- Set `donateUrl` to a Buy Me a Coffee / Ko-fi link - it appears in house ads.
- Later, create a Stripe Payment Link for an ad-free "Pro" tier and put it in
  `premiumUrl` once you have traffic worth converting.

### 4. Analytics (know what's working)

Set `analytics.plausibleDomain` (paid, privacy-friendly, no consent banner
needed) or `analytics.gaMeasurementId` (free) in `js/config.js`.

## Growth playbook (traffic = revenue)

- **SEO (the long game, biggest payoff).** Each test page targets a high-volume
  keyword: reaction time test, aim trainer, typing test / WPM test, chimp test,
  number memory test, sequence memory, visual memory, verbal memory. Pages ship
  with unique meta descriptions, FAQ schema (eligible for rich results), and
  original how-to content. Submit the sitemap and give it time; these keywords
  have huge volume and the content is genuinely useful.
- **Share loops.** Every result screen has "Challenge a friend" - the share
  text includes the score, percentile and a link. Post your own scores in
  Discord servers, subreddits (r/reactiongifs no - think r/pcgaming,
  r/GlobalOffensive, r/VALORANT warmup threads), and group chats.
- **TikTok/Shorts angle.** Screen-record "average person vs me on the chimp
  test" attempts. This niche clips extremely well and links back cleanly.
- **Classrooms and offices.** The typing test spreads on its own in schools -
  it is the classic "bored in IT class" site. Streaks bring people back daily.

## Project structure

```
index.html                 home: test grid, stats, test-of-the-day
reaction-time/  aim-trainer/  typing-test/  sequence-memory/
number-memory/  visual-memory/  chimp-test/  verbal-memory/
about/  privacy/           content pages (AdSense approval needs these)
404.html
css/site.css               the whole design system
js/config.js               ALL monetization/branding settings
js/core.js                 engine: scoring, percentiles, storage, share, ads
js/home.js                 home page rendering
js/games/*.js              one small state machine per test
data/words.js              word pools for typing/verbal tests
robots.txt  sitemap.xml  ads.txt
```

Scores are stored in localStorage under the key `reactmeter.v1`. Percentiles
are estimated from published population medians for tests of this kind using
normal/log-normal models in `js/core.js` (`TESTS[...].dist`).

## Ideas for v2

- Global daily challenge + leaderboard (Supabase free tier works well here)
- OG share images per test (currently text-only shares)
- More tests: hearing/audio reaction, color perception, N-back
- Localization - these keywords have volume in every language

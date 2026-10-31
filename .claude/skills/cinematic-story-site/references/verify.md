# Verification

Always test in an **isolated** browser profile — never drive the user's own browser session.

## Headless Chrome (CDP)
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9333 \
  --user-data-dir="$SCRATCH/chrome-test" --use-angle=metal --enable-gpu --ignore-gpu-blocklist \
  --window-size=1440,900 --no-first-run about:blank &
curl -s -X PUT "http://127.0.0.1:9333/json/new?http://127.0.0.1:5174/"   # → target id
```
Small Node driver (Node 22 has global WebSocket): `Emulation.setDeviceMetricsOverride` (390×844 mobile),
`Emulation.setTouchEmulationEnabled`, `Input.dispatchTouchEvent` / `Input.dispatchMouseEvent{type:'mouseWheel'}`
for *real* gestures (programmatic `scrollTo` doesn't exercise locks), `Runtime.evaluate` to measure,
`Page.captureScreenshot` for images. Collect `Runtime.exceptionThrown`.

Measure, e.g.:
```js
const k = el.getBoundingClientRect(); return { centre: k.left + k.width / 2, vw: innerWidth,
  overflow: document.documentElement.scrollWidth - innerWidth };
```
Timings: poll a state flag every 40–50 ms and log transitions with timestamps.

## Real Safari (WebKit) via safaridriver
User enables Safari → Settings → Advanced → "Show features for web developers", then Developer →
"Allow remote automation". Then:
```bash
/usr/bin/safaridriver --port 4445 &   # run in background
```
W3C WebDriver over fetch: `POST /session {capabilities:{alwaysMatch:{browserName:'safari'}}}`,
`/window/rect`, `/url` (add `?v=${Date.now()}` to bust module cache), `/element` + `/click` for a *real*
user gesture (needed for audio), `/execute/sync`, `/screenshot`. Delete the session when done.

## Contact sheets
Pillow: resize screenshots and paste into one grid image, then Read it — review many states at once.
(Use the Python that has Pillow, e.g. `/opt/homebrew/bin/python3.14`.)

## Reference capture
Navigate to the reference site, scroll by viewport height, capture each screen + `document.body.innerText`
to harvest real copy.

# First Deposit Experiment

**DRI:** Justin Zhou

Interactive experiment design document for Crimson first deposit activation.

## View the page

Open `index.html` in a browser. The experiment doc populates with live data from `first-anc-behavior.js`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `dashboard.css` | Styles |
| `dashboard.js` | Renders experiment sections from the data file |
| `first-anc-behavior.js` | Data payload (generated from Snowflake via `build_first_anc_dash_data.py` in the main repo) |

## Experiment: "Your first $10 spend is on us when you add money to Crimson"

- **Problem:** ~89% of Crimson MAU have $0 ancillary deposits. 94% of new dashers never deposit in their first 28 days.
- **Belief:** Intent to spend on a specific, time-sensitive need (groceries, bills) is what pulls forward a first deposit. Deposit and spend are not two steps — they are one moment.
- **Design:** Randomized A/B. Treatment gets $10 credit on first card swipe after first external deposit. Optional Arm B adds a second-deposit follow-up nudge.
- **Primary metric:** F7D / F14D any external deposit rate.

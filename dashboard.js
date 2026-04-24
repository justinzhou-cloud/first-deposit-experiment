/* Experiment-only dashboard — renders the experiment doc from first-anc-behavior.js data */
(function () {
  "use strict";

  function fmtInt(n) {
    if (n == null || isNaN(n)) return "—";
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function fmtUsd(n) {
    if (n == null || n === "" || (typeof n === "number" && isNaN(n))) return "—";
    var v = Number(n);
    if (isNaN(v)) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);
  }

  function getPayload() {
    var p = window.__FIRST_ANC_BEHAVIOR__;
    if (!p || typeof p !== "object") return { _bad: true };
    return p;
  }

  function renderExpTab() {
    var p = getPayload();
    if (p._bad) {
      var w = document.getElementById("am-warn");
      if (w) {
        w.hidden = false;
        w.textContent = "Missing data file (first-anc-behavior.js). Numbers will show as dashes.";
        w.classList.add("am-warn-caution");
      }
    }
    var k = (p && p.kpi) || {};
    var dc = (p && p.deposit_compare) || {};
    var wa = dc.with_anc_in_study || {};
    var wo = dc.without_anc_in_study || {};
    var d = (p && p.deposit_motivation) || {};
    var nJoin = k.n_crimson_joined_dashers || dc.n_crimson_joined || 0;
    var nDep = k.n_cohort_dashers || k.n_joined_with_anc_in_study || 0;
    var pctDep = nJoin > 0 ? (100 * nDep / nJoin).toFixed(1) : "—";
    var nNoDep = nJoin - nDep;
    var aDiff = k.all_txn_pct_diff_vol;
    var oDiff = k.out_pos_pct_diff_vol;
    var medFirst = k.med_first_anc_usd;

    var el = function (id) { return document.getElementById(id); };
    function pctOf(a, b) { return (a && b && b > 0) ? "+" + ((a / b - 1) * 100).toFixed(0) + "%" : "—"; }

    var upd = el("exp-updated");
    if (upd) upd.textContent = "April 23, 2026";

    // --- BUSINESS PROBLEM ---
    var prob = el("exp-problem");
    if (prob) prob.innerHTML =
      "<p><strong>Crimson growth is an activation problem, not a conversion problem.</strong> " +
      "(Source: <em>Tharun Kumar Reddy, analysis of 2.75M Crimson dashers, Apr 20 2026</em>)</p>" +
      "<p>Of <strong>" + fmtInt(nJoin) + "</strong> dashers who joined Crimson (Oct 2025 &ndash; Mar 2026), " +
      "only <strong>" + pctDep + "%</strong> (" + fmtInt(nDep) + ") ever made a first external deposit. " +
      "The other <strong>~" + fmtInt(nNoDep) + "</strong> never added money at all.</p>" +
      "<p>Across all MAU: <strong>87&ndash;89%</strong> have $0 ancillary deposits in L28D. " +
      "The &ldquo;near-miss&rdquo; group ($180&ndash;$199, $20 short of durable) is negligible at ~0.25%. " +
      "94% of new dashers make no deposit in their first 28 days. " +
      "Growth does not come from nudging the few who are close &mdash; it comes from <strong>activating the many who never begin</strong>.</p>" +
      "<p><strong>The question this experiment answers:</strong> Can we break the $0 &rarr; first-deposit barrier by " +
      "bundling deposit and spend into a single &ldquo;first money moment&rdquo;? And is this more effective for <strong>new users (F7D)</strong> " +
      "vs. <strong>existing users</strong> who have been on Crimson longer but never deposited?</p>";

    // --- EVIDENCE ---
    var evi = el("exp-evidence");
    if (evi) {
      var grocRow = null;
      var mcc = (p && p.out_pos_mcc_uplift) || [];
      for (var i = 0; i < mcc.length; i++) {
        if (mcc[i].mcc === "5411") { grocRow = mcc[i]; break; }
      }
      evi.innerHTML =
        "<h4>1. Most dashers never start (from Tharun&rsquo;s analysis)</h4>" +
        "<table class=\"am-doc-table\">" +
        "<tbody>" +
        "<tr><td>MAU with $0 ancillary deposits (L28D)</td><td><strong>87&ndash;89%</strong></td></tr>" +
        "<tr><td>New dashers with no deposit in first 28d</td><td><strong>94%</strong></td></tr>" +
        "<tr><td>Never-durables with $0 lifetime ancillary</td><td><strong>77.6%</strong></td></tr>" +
        "<tr><td>&ldquo;Near-miss&rdquo; ($180&ndash;$199) share of MAU</td><td>~0.25% (~4&ndash;5K of 1.7M+)</td></tr>" +
        "</tbody></table>" +
        "<h4>2. Early behavior predicts durability</h4>" +
        "<p>The ~0.45% who become durable within 14 days separate immediately (from Tharun):</p>" +
        "<table class=\"am-doc-table\">" +
        "<thead><tr><th></th><th>Durable in 14d</th><th>Everyone else</th><th>Multiple</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>Shift hours</td><td>51h</td><td>17h</td><td>3&times;</td></tr>" +
        "<tr><td>DxPay ($)</td><td>$670</td><td>$151</td><td>4&times;</td></tr>" +
        "<tr><td>POS spend ($)</td><td>$671</td><td>$40</td><td>16&times;</td></tr>" +
        "<tr><td>Second deposit rate</td><td>73%</td><td>1.4%</td><td>50&times;</td></tr>" +
        "</tbody></table>" +
        "<h4>3. Deposit and spend are tightly coupled in the first 24h (Justin&rsquo;s analysis, " + fmtInt(nDep) + " depositors)</h4>" +
        "<table class=\"am-doc-table\">" +
        "<thead><tr><th></th><th>Depositors</th><th>Non-depositors</th><th>Diff</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>n</td><td>" + fmtInt(nDep) + "</td><td>" + fmtInt(nNoDep) + "</td><td></td></tr>" +
        "<tr><td>Median card spend (study window)</td><td>" + fmtUsd(wa.p50_out_pos) + "</td><td>" + fmtUsd(wo.p50_out_pos) + "</td><td>" + pctOf(wa.p50_out_pos, wo.p50_out_pos) + "</td></tr>" +
        "<tr><td>Median Crimson gross</td><td>" + fmtUsd(wa.p50_crimson_gross) + "</td><td>" + fmtUsd(wo.p50_crimson_gross) + "</td><td>" + pctOf(wa.p50_crimson_gross, wo.p50_crimson_gross) + "</td></tr>" +
        "<tr><td>Median dash hours</td><td>" + (wa.p50_dash_hrs != null ? Number(wa.p50_dash_hrs).toFixed(1) + "h" : "—") + "</td><td>" + (wo.p50_dash_hrs != null ? Number(wo.p50_dash_hrs).toFixed(1) + "h" : "—") + "</td><td>" + pctOf(wa.p50_dash_hrs, wo.p50_dash_hrs) + "</td></tr>" +
        "</tbody></table>" +
        "<ol class=\"am-doc-ol\">" +
        "<li><strong>Card spend nearly doubles the day after deposit.</strong> " +
          (oDiff != null ? "Card (OUT_POS) volume is <strong>+" + Number(oDiff).toFixed(0) + "%</strong> " : "Card volume is higher ") +
          "in the 24h after vs the 24h before the first deposit." +
          (aDiff != null ? " Total activity is +" + Number(aDiff).toFixed(0) + "%." : "") + "</li>" +
        "<li><strong>" + (d.n_with_out_pos_24h_after && d.n_cohort ? (100 * d.n_with_out_pos_24h_after / d.n_cohort).toFixed(0) : "67") +
          "% of depositors swipe the card within 24h of their first deposit.</strong> " +
          "Median time to first swipe: <strong>~" + (d.med_hours_to_first_out_pos_after ? Number(d.med_hours_to_first_out_pos_after).toFixed(1) : "5") + " hours</strong>. " +
          "Deposit and spend are not two separate decisions &mdash; they happen in the <strong>same session</strong>.</li>" +
        "<li><strong>What they spend on shifts toward need-based categories.</strong> " +
          (grocRow ? "Grocery share of card $ rises <strong>+" + Number(grocRow.share_uplift_pp).toFixed(1) + " pp</strong> " +
            "(volume +" + Number(grocRow.pct_diff_vol).toFixed(0) + "%). " : "") +
          "Gas (routine, small) <em>declines</em> in share. Rent, bills, and gaming <em>rise</em>. " +
          "Deposits are pulled by <strong>intent to make a specific purchase</strong>, not a savings goal.</li>" +
        "<li><strong>The typical first deposit is small.</strong> Median: <strong>" + fmtUsd(medFirst) + "</strong>. " +
          "48% of first deposits are under $20. This is not a &ldquo;move my paycheck&rdquo; behavior &mdash; it&rsquo;s a top-up to cover an immediate need.</li>" +
        "</ol>" +
        "<h4>4. Engagement &ne; durability (Tharun)</h4>" +
        "<p>42&ndash;55% of new cohorts are <strong>engaged but not durable</strong>. Only ~1&ndash;2% reach durable. " +
        "There are two parallel systems: an <em>engagement system</em> (dashing, spend) and an <em>inflow system</em> (external money in). " +
        "Improving engagement does not automatically fix inflow. <strong>A spend-only incentive will reward existing behavior without moving deposits.</strong></p>";
    }

    // --- CORE BELIEF ---
    var bel = el("exp-belief");
    if (bel) bel.innerHTML =
      "<p><strong>Core belief:</strong> The first deposit is not a &ldquo;step&rdquo; users decide to take. It is pulled by a <strong>specific, " +
      "time-sensitive spending need</strong> (groceries, a bill, a larger purchase) that requires money the user doesn&rsquo;t have on Crimson yet.</p>" +
      "<p><strong>Why this matters for experiment design:</strong></p>" +
      "<ol class=\"am-doc-ol\">" +
      "<li>A two-step incentive (deposit &rarr; spend &rarr; reward) creates <strong>two drop-off points</strong> in a funnel where 94% already don&rsquo;t clear step 1.</li>" +
      "<li>A spend-only incentive rewards behavior that already happens (42&ndash;55% are engaged without depositing) and <strong>does not move deposits</strong>.</li>" +
      "<li>A deposit-only incentive ($5 for first deposit) misses the insight: users don&rsquo;t think &ldquo;I deposited.&rdquo; They think &ldquo;<strong>I can use this now.</strong>&rdquo;</li>" +
      "</ol>" +
      "<p>The shift: instead of steps, design for <strong>the first moment money becomes usable</strong>. " +
      "Bundle deposit + spend into a single action so users experience one thing: &ldquo;this account works for me.&rdquo;</p>" +
      "<p><strong>What we want to falsify:</strong> Does creating a concrete reason to spend on Crimson " +
      "pull forward a first deposit &mdash; and does that first &ldquo;money moment&rdquo; lead to sustained activity? " +
      "Is the effect stronger for new users (F7D) than for existing users who have drifted?</p>";

    // --- PROPOSAL ---
    var prop = el("exp-proposal");
    if (prop) prop.innerHTML =
      "<div class=\"am-doc-callout\"><strong>&ldquo;Your first $10 purchase is on us after your first qualifying deposit of $10+.&rdquo;</strong></div>" +
      "<p>Any type of external deposit qualifies (AFT, P2P in, ACH, OCT &mdash; any ancillary in). " +
      "Minimum deposit: <strong>$10</strong> (prevents gaming while keeping the bar low; median organic first deposit is " + fmtUsd(medFirst) + "). " +
      "After the qualifying deposit, the user&rsquo;s first card purchase (any MCC, up to $10) is credited back automatically.</p>" +
      "<p><strong>Why this framing:</strong></p>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Approach</th><th>Problem</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Deposit-only bonus ($5 for first deposit)</td><td>No reason to use the card afterward; doesn&rsquo;t create a &ldquo;money moment&rdquo;</td></tr>" +
      "<tr><td>Spend-only bonus (cashback)</td><td>Rewards behavior that already happens in 42&ndash;55% of engaged non-depositors; doesn&rsquo;t move deposit rate</td></tr>" +
      "<tr><td>Two-step (deposit &rarr; spend &rarr; reward)</td><td>Two drop-off points; feels like a checklist, not a natural moment</td></tr>" +
      "<tr><td><strong>&ldquo;First $10 on us after $10+ deposit&rdquo;</strong></td><td><strong>Forces deposit (quietly), naturally drives spend, feels like one action. Min deposit prevents gaming.</strong></td></tr>" +
      "</tbody></table>";

    // --- HYPOTHESES ---
    var hyp = el("exp-hypotheses");
    if (hyp) hyp.innerHTML =
      "<ol class=\"am-doc-ol\">" +
      "<li><strong>H1: The bundled offer breaks the $0 barrier.</strong> Treatment users will have a higher F7D / F14D first-deposit rate than control.</li>" +
      "<li><strong>H2: New users (F7D) are more malleable than existing non-depositors.</strong> Arm A (F7D) will show a larger deposit-rate lift than Arm B (existing &gt;7D), because early adoption habits are easier to form.</li>" +
      "<li><strong>H3: The first money moment drives spend.</strong> Treatment depositors will make their first card purchase faster " +
        "(vs. ~" + (d.med_hours_to_first_out_pos_after ? Number(d.med_hours_to_first_out_pos_after).toFixed(0) : "5") + "h organic median).</li>" +
      "<li><strong>H4: The behavior is sticky.</strong> Treatment depositors will show higher card spending and deposit activity in the 30 days <em>after</em> the credit vs. control, because the first experience creates a new mental model for the account.</li>" +
      "<li><strong>H5: Second deposit follows.</strong> Treatment depositors will deposit again within 30 days at a higher rate than the ~1.4% non-durable baseline (per Tharun).</li>" +
      "</ol>";

    // --- METRICS ---
    var met = el("exp-metrics");
    if (met) met.innerHTML =
      "<h4>Primary</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Metric</th><th>Definition</th><th>Baseline</th><th>Success threshold</th></tr></thead>" +
      "<tbody>" +
      "<tr><td><strong>F7D / F14D first external deposit rate</strong></td><td>% of eligible users making first ancillary deposit ($10+) in 7 / 14 days</td>" +
        "<td>~6% in F28D (94% never); ~" + pctDep + "% in 6 mo</td><td>+3 pp lift vs control in F14D</td></tr>" +
      "<tr><td><strong>F14D card spend</strong></td><td>Median OUT_POS $ per user who deposits, 14d post</td><td>" + fmtUsd(d.median_out_pos_usd_post_24h_per_user) + " (24h post, organic)</td><td>+15% vs control depositors</td></tr>" +
      "<tr><td><strong>30d second deposit rate</strong></td><td>% of first-depositors who deposit again in next 30d</td><td>~1.4% (non-durable baseline)</td><td>+50% relative lift</td></tr>" +
      "</tbody></table>" +
      "<h4>Secondary</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Metric</th><th>Success threshold</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Time from deposit to first card swipe (hours)</td><td>&lt; 4h median (vs. ~" + (d.med_hours_to_first_out_pos_after ? Number(d.med_hours_to_first_out_pos_after).toFixed(0) : "5") + "h organic)</td></tr>" +
      "<tr><td>Dashing hours (30d post)</td><td>+5% vs control</td></tr>" +
      "<tr><td>Post-credit 30d card spend (no incentive active)</td><td>Treatment &gt; control (sticky)</td></tr>" +
      "<tr><td>Arm A vs Arm B deposit-rate lift</td><td>Arm A (F7D) &gt; Arm B (existing) &mdash; validates early-window hypothesis</td></tr>" +
      "</tbody></table>" +
      "<h4>Check metrics</h4>" +
      "<ul>" +
      "<li>Deposit size: are users depositing exactly $10 to game the minimum? Monitor distribution vs. organic median of " + fmtUsd(medFirst) + "</li>" +
      "<li>Card decline rate: &gt;5% increase = flag</li>" +
      "<li>Return/refund on the credited transaction</li>" +
      "<li>Cost per converted depositor (target: &lt;$15 all-in incl. credit)</li>" +
      "</ul>";

    // --- EXPERIMENT DESIGN ---
    var des = el("exp-design");
    if (des) des.innerHTML =
      "<table class=\"am-doc-table\">" +
      "<tbody>" +
      "<tr><td><strong>Method</strong></td><td>Randomized controlled trial, user-level assignment</td></tr>" +
      "<tr><td><strong>Arms</strong></td><td>" +
        "<strong>Control:</strong> No offer. Standard Crimson experience.<br>" +
        "<strong>Arm A (F7D new users):</strong> Users within their first 7 days on Crimson who have never deposited. Receive the &ldquo;first $10 on us&rdquo; offer.<br>" +
        "<strong>Arm B (existing &gt;7D):</strong> Users who have been on Crimson &gt;7 days but have never made an ancillary deposit (Drifters / Pass-through). Same offer." +
      "</td></tr>" +
      "<tr><td><strong>Qualifying deposit</strong></td><td>Any ancillary in (AFT, P2P in, ACH, OCT, ATM) of <strong>$10 or more</strong>. DxPay (dasher earnings) does not qualify.</td></tr>" +
      "<tr><td><strong>Reward</strong></td><td>$10 credit applied to the user&rsquo;s first card purchase (any MCC) within 7 days of the qualifying deposit. One reward per user.</td></tr>" +
      "<tr><td><strong>Window</strong></td><td>Arm A: offer shown at Crimson join, expires 7 days after join. Arm B: offer shown at enrollment, expires 14 days after.</td></tr>" +
      "</tbody></table>" +
      "<h4>Sizing &amp; budget (target &lt;$100K)</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th></th><th>Arm A (F7D new)</th><th>Arm B (existing &gt;7D)</th><th>Control</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Eligible pool (est.)</td><td>~30K new joiners/mo</td><td>~" + fmtInt(nNoDep) + " existing never-deposited</td><td>Same pools</td></tr>" +
      "<tr><td>Sample per arm</td><td>15K treatment / 15K control</td><td>30K treatment / 30K control</td><td>(shared control)</td></tr>" +
      "<tr><td>Expected conversion</td><td>5&ndash;10% deposit in F7D</td><td>2&ndash;5% deposit in 14D</td><td></td></tr>" +
      "<tr><td>Max converting users</td><td>~1,500</td><td>~1,500</td><td></td></tr>" +
      "<tr><td>Max credit cost</td><td>$15,000</td><td>$15,000</td><td></td></tr>" +
      "<tr><td><strong>Total budget cap</strong></td><td colspan=\"2\"><strong>$30,000 in credits + comms costs. Well under $100K.</strong></td><td></td></tr>" +
      "</tbody></table>" +
      "<p>If initial conversion is higher than expected, we can cap enrollment or extend to more users &mdash; the per-user cost is fixed at $10 max.</p>" +
      "<h4>Comms plan</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Timing</th><th>Channel</th><th>Message</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Arm A: at Crimson join</td><td>In-App + Email</td><td>&ldquo;Your first $10 purchase is on us. Add $10+ to Crimson and your first swipe is free.&rdquo;</td></tr>" +
      "<tr><td>Arm A: Day 3</td><td>Push</td><td>&ldquo;You&rsquo;ve got $10 waiting. Add money to Crimson and your first spend is free.&rdquo;</td></tr>" +
      "<tr><td>Arm A: Day 6</td><td>Push</td><td>&ldquo;Last day: add $10+ now and we cover your first purchase.&rdquo;</td></tr>" +
      "<tr><td>Arm B: enrollment</td><td>In-App + Email</td><td>&ldquo;Your first $10 purchase is on us. Add $10+ to get started.&rdquo;</td></tr>" +
      "<tr><td>Arm B: Day 7</td><td>Push</td><td>&ldquo;One week left: add money and your first purchase is free.&rdquo;</td></tr>" +
      "<tr><td>Both: post-credit</td><td>In-App</td><td>&ldquo;Nice! $10 credited. Your Crimson card is ready for whatever&rsquo;s next.&rdquo;</td></tr>" +
      "</tbody></table>";

    // --- SUCCESS ---
    var suc = el("exp-success");
    if (suc) suc.innerHTML =
      "<p>We consider the experiment successful if:</p>" +
      "<ol class=\"am-doc-ol\">" +
      "<li>Either treatment arm has a <strong>statistically significant higher first-deposit rate</strong> than its control.</li>" +
      "<li>Treatment depositors <strong>spend on the card within 24h at a higher rate</strong> than control organic depositors.</li>" +
      "<li>In the <strong>30 days after the credit is used</strong> (no incentive active), treatment depositors show <strong>higher card spending and deposit activity</strong> than control depositors.</li>" +
      "</ol>" +
      "<p><strong>Arm A vs Arm B comparison:</strong> We expect Arm A (F7D) to show a stronger lift than Arm B (existing). " +
      "If confirmed, this validates that early activation &mdash; catching users in their first week &mdash; is the highest-leverage window.</p>";

    // --- DECISIONS (next steps based on results) ---
    var dec = el("exp-decisions");
    if (dec) dec.innerHTML =
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Result</th><th>What it means</th><th>Next step</th></tr></thead>" +
      "<tbody>" +
      "<tr><td><strong>Both arms show significant deposit + durability lift</strong></td><td>The incentive works broadly; deposit barrier is spend-intent-driven for new and existing users alike</td>" +
        "<td><strong>Roll out to all never-deposited users</strong> as a standing Crimson benefit. Scale budget proportionally.</td></tr>" +
      "<tr><td><strong>Only Arm A (F7D) shows significant lift</strong></td><td>Early activation is the malleable window; existing users are harder to move (Drifters / Pass-through are sticky in their non-use)</td>" +
        "<td><strong>Make it a sign-up / onboarding offer</strong> for all new Crimson users. Explore different levers for existing non-depositors (product-led, auto-transfer rails).</td></tr>" +
      "<tr><td><strong>Only Arm B (existing) shows lift</strong></td><td>Unexpected &mdash; existing non-depositors were waiting for a reason, not stuck in a habit window</td>" +
        "<td>Investigate further; consider broadening to re-engagement campaigns.</td></tr>" +
      "<tr><td><strong>Neither arm shows significant lift</strong></td><td>The $0 barrier is not spend-intent-driven; deposit behavior may be a trait, not a lever</td>" +
        "<td><strong>Scrap and rework.</strong> Shift to product-led activation (friction reduction, plaid, auto-transfers) rather than incentive-based experiments.</td></tr>" +
      "</tbody></table>";

    // --- TIMELINE ---
    var tl = el("exp-timeline");
    if (tl) tl.innerHTML =
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Milestone</th><th>Target date</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Experiment doc finalized + team alignment</td><td>Apr 25, 2026</td></tr>" +
      "<tr><td>Eligibility SQL + randomization built</td><td>May 2, 2026</td></tr>" +
      "<tr><td>Launch (comms go live, both arms)</td><td>May 5, 2026</td></tr>" +
      "<tr><td>Week 1 early signal (F7D deposit rate, Arm A)</td><td>May 12, 2026</td></tr>" +
      "<tr><td>Week 2 readout (F14D deposit + first spend timing, both arms)</td><td>May 19, 2026</td></tr>" +
      "<tr><td>Week 4 mid-test (card spend, dashing, Arm A vs B)</td><td>Jun 2, 2026</td></tr>" +
      "<tr><td>Post-period sustainability (30d after last credit, no incentive)</td><td>Jul 7, 2026</td></tr>" +
      "</tbody></table>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderExpTab);
  } else {
    renderExpTab();
  }
})();

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
    if (upd) upd.textContent = "April 22, 2026";

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
      "bundling deposit and spend into a single &ldquo;first money moment&rdquo; &mdash; rather than asking users to complete separate steps?</p>";

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
      "<p><strong>What we want to falsify:</strong> Does creating a concrete reason to spend on Crimson (a free first purchase) " +
      "pull forward a first deposit &mdash; and does that first &ldquo;money moment&rdquo; lead to sustained activity? " +
      "Or is deposit behavior simply a trait of already-engaged dashers that cannot be influenced?</p>";

    var prop = el("exp-proposal");
    if (prop) prop.innerHTML =
      "<div class=\"am-doc-callout\"><strong>&ldquo;Your first $10 spend is on us when you add money to Crimson.&rdquo;</strong></div>" +
      "<p>Users who have never deposited get a <strong>$10 credit toward their first card purchase</strong> after they add any amount of external money to Crimson. " +
      "The credit is applied automatically to their first qualifying card swipe (any MCC) within 7 days of the deposit.</p>" +
      "<p><strong>Why this works better than alternatives:</strong></p>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Approach</th><th>Problem</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Deposit-only bonus ($5 for first deposit)</td><td>No reason to use the card afterward; doesn&rsquo;t create a &ldquo;money moment&rdquo;</td></tr>" +
      "<tr><td>Spend-only bonus (cashback on grocery)</td><td>Rewards behavior that already happens in 42&ndash;55% of engaged non-depositors; doesn&rsquo;t move deposit rate</td></tr>" +
      "<tr><td>Two-step (deposit &rarr; spend &rarr; reward)</td><td>Two drop-off points; feels like a checklist, not a natural moment</td></tr>" +
      "<tr><td><strong>&ldquo;First $10 on us&rdquo; (this idea)</strong></td><td><strong>Forces deposit (quietly), naturally drives spend, feels like one action</strong></td></tr>" +
      "</tbody></table>";

    var hyp = el("exp-hypotheses");
    if (hyp) hyp.innerHTML =
      "<ol class=\"am-doc-ol\">" +
      "<li><strong>H1: &ldquo;First $10 on us&rdquo; breaks the $0 barrier.</strong> Treatment users will have a higher F7D / F14D first-deposit rate than control.</li>" +
      "<li><strong>H2: The bundled moment drives spend.</strong> Treatment users who deposit will make their first card purchase faster " +
        "(median time to first OUT_POS from deposit: currently ~" + (d.med_hours_to_first_out_pos_after ? Number(d.med_hours_to_first_out_pos_after).toFixed(0) : "5") + "h in organics; we expect &lt; 4h in treatment).</li>" +
      "<li><strong>H3: The first money moment is sticky.</strong> Treatment depositors will show higher card spending and deposit activity in the 30 days <em>after</em> the credit vs. control organics, because the first experience creates a new mental model for the account.</li>" +
      "<li><strong>H4: Second deposit follows.</strong> Treatment users who deposit once will deposit again within 30 days at a higher rate than baseline (~1.4% second-deposit rate in non-durables, per Tharun). A parallel arm can test a follow-up second-deposit nudge.</li>" +
      "</ol>";

    var met = el("exp-metrics");
    if (met) met.innerHTML =
      "<h4>Primary</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Metric</th><th>Definition</th><th>Baseline</th><th>Success threshold</th></tr></thead>" +
      "<tbody>" +
      "<tr><td><strong>F7D / F14D any external deposit rate</strong></td><td>% of eligible users making first ancillary deposit in 7 / 14 days</td>" +
        "<td>~6% deposit in F28D (94% never); ~" + pctDep + "% in 6 mo</td><td>+3 pp lift vs control in F14D</td></tr>" +
      "<tr><td><strong>F14D card spend</strong></td><td>Median OUT_POS $ per user in 14d post-deposit</td><td>" + fmtUsd(d.median_out_pos_usd_post_24h_per_user) + " (24h post, current organics)</td><td>+15% vs control depositors</td></tr>" +
      "<tr><td><strong>30d sustained deposit activity</strong></td><td>% of first-depositors who deposit again in next 30d</td><td>~1.4% (non-durable baseline per Tharun)</td><td>+50% relative lift (to ~2%+)</td></tr>" +
      "</tbody></table>" +
      "<h4>Secondary</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Metric</th><th>Success threshold</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Time from deposit to first card swipe (hours)</td><td>&lt; 4h median (vs. ~" + (d.med_hours_to_first_out_pos_after ? Number(d.med_hours_to_first_out_pos_after).toFixed(0) : "5") + "h organic)</td></tr>" +
      "<tr><td>Dashing hours (30d post)</td><td>+5% vs control</td></tr>" +
      "<tr><td># distinct MCC categories used in 30d post-deposit</td><td>+10% vs control</td></tr>" +
      "<tr><td>Post-credit 30d card spend (no incentive active)</td><td>Treatment > control (sticky, not just bonus-driven)</td></tr>" +
      "</tbody></table>" +
      "<h4>Check metrics</h4>" +
      "<ul>" +
      "<li>Deposit size: are users depositing $0.01 just to trigger the credit? Monitor median deposit amount vs. organic " + fmtUsd(medFirst) + "</li>" +
      "<li>Card decline rate: &gt;5% increase = flag</li>" +
      "<li>Return/refund on the credited transaction</li>" +
      "<li>Cost per converted depositor (target: &lt; $15 all-in incl. credit)</li>" +
      "</ul>";

    var des = el("exp-design");
    if (des) des.innerHTML =
      "<table class=\"am-doc-table\">" +
      "<tbody>" +
      "<tr><td><strong>Method</strong></td><td>Randomized A/B at the user level, 50/50 split. Stratify by days since Crimson join.</td></tr>" +
      "<tr><td><strong>Eligibility</strong></td><td>Crimson users with $0 lifetime ancillary deposits AND &ge;1 Crimson transaction in L28D (active, never-deposited)</td></tr>" +
      "<tr><td><strong>Treatment</strong></td><td>&ldquo;Your first $10 spend is on us when you add money to Crimson.&rdquo; User adds any external amount &rarr; first card swipe within 7d gets up to $10 credited back automatically.</td></tr>" +
      "<tr><td><strong>Control</strong></td><td>No offer. Standard Crimson experience.</td></tr>" +
      "<tr><td><strong>Optional Arm B</strong></td><td>Same as treatment + follow-up &ldquo;second deposit&rdquo; nudge for those who complete the first moment (tests Tharun&rsquo;s parallel-path idea: do we see incremental lift from chaining?)</td></tr>" +
      "<tr><td><strong>Sample size</strong></td><td>~200k per arm (from ~" + fmtInt(nNoDep) + " eligible non-depositors)</td></tr>" +
      "<tr><td><strong>Budget</strong></td><td>$10 max per converting user. At 5% conversion: ~$100k. At 10%: ~$200k. Cap budget at $250k.</td></tr>" +
      "</tbody></table>" +
      "<h4>Comms plan</h4>" +
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Timing</th><th>Channel</th><th>Message</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Launch</td><td>Email + In-App</td><td>&ldquo;Your first $10 purchase is on us. Just add money to get started.&rdquo;</td></tr>" +
      "<tr><td>Day 3</td><td>Push</td><td>&ldquo;You&rsquo;ve got $10 waiting. Add money to Crimson and your first spend is free.&rdquo;</td></tr>" +
      "<tr><td>Day 6</td><td>Push</td><td>&ldquo;Last day: add money now and we cover your first $10.&rdquo;</td></tr>" +
      "<tr><td>Post-credit</td><td>In-App</td><td>&ldquo;Nice! $10 credited. Your Crimson card is ready for whatever&rsquo;s next.&rdquo;</td></tr>" +
      "</tbody></table>";

    var suc = el("exp-success");
    if (suc) suc.innerHTML =
      "<p>We consider the experiment successful if:</p>" +
      "<ol class=\"am-doc-ol\">" +
      "<li>Treatment group has a <strong>statistically significant higher F14D first-deposit rate</strong> than control.</li>" +
      "<li>Treatment depositors <strong>spend on the card within 24h at a higher rate</strong> than control organic depositors " +
        "(validating that the &ldquo;bundled moment&rdquo; framing creates a tighter deposit&ndash;spend connection).</li>" +
      "<li>In the <strong>30 days after the credit is used</strong> (no incentive active), treatment depositors show <strong>higher card spending and deposit activity</strong> than control depositors.</li>" +
      "</ol>" +
      "<p><strong>If all three hold:</strong> We have evidence that (a) spend-intent is a causal lever for first deposits, " +
      "(b) bundling deposit + spend into one moment is more effective than step-based incentives, and " +
      "(c) the first money moment creates durable behavior change. <strong>Scale it.</strong></p>" +
      "<p><strong>If (1) holds but (3) doesn&rsquo;t:</strong> The credit drives trial but not habit. " +
      "Consider a follow-up retention intervention (second-deposit nudge, or the parallel arm B) rather than scaling the credit alone.</p>" +
      "<p><strong>If neither holds:</strong> The $0 barrier is not spend-intent-driven. " +
      "Revisit the hypothesis &mdash; the deposit problem may require product changes (e.g. friction reduction, plaid, auto-transfers) rather than incentives.</p>";

    var dec = el("exp-decisions");
    if (dec) dec.innerHTML =
      "<ol class=\"am-doc-ol\">" +
      "<li><strong>Evergreen:</strong> If incremental value (increased dashing, spending, deposits) exceeds $10/user, roll out as a permanent new-user Crimson onboarding benefit.</li>" +
      "<li><strong>Acquisition bonus:</strong> If not ROI-positive in month 1 but positive over 90 days (sustained behavior), structure as a limited-time F14D offer for new Crimson users.</li>" +
      "<li><strong>Pair with second-deposit:</strong> If Arm B (first moment + second-deposit nudge) shows incremental lift over Arm A, adopt the two-stage approach &mdash; aligns with Tharun&rsquo;s finding that second deposit increases durable probability by &gt;30%.</li>" +
      "<li><strong>Redesign:</strong> If no deposit lift, retire incentive approach. Shift to product-led activation (reduced friction, auto-transfer rails, plaid).</li>" +
      "</ol>";

    var tl = el("exp-timeline");
    if (tl) tl.innerHTML =
      "<table class=\"am-doc-table\">" +
      "<thead><tr><th>Milestone</th><th>Target date</th></tr></thead>" +
      "<tbody>" +
      "<tr><td>Experiment doc finalized + team alignment</td><td>Apr 25, 2026</td></tr>" +
      "<tr><td>Eligibility SQL + randomization built</td><td>May 2, 2026</td></tr>" +
      "<tr><td>Launch (comms go live)</td><td>May 5, 2026</td></tr>" +
      "<tr><td>Week 1 early signal (F7D deposit rate)</td><td>May 12, 2026</td></tr>" +
      "<tr><td>Week 2 readout (F14D deposit + first spend timing)</td><td>May 19, 2026</td></tr>" +
      "<tr><td>Week 4 mid-test (card spend, dashing, Arm B check)</td><td>Jun 2, 2026</td></tr>" +
      "<tr><td>Post-period sustainability (30d after last credit, no incentive)</td><td>Jul 7, 2026</td></tr>" +
      "</tbody></table>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderExpTab);
  } else {
    renderExpTab();
  }
})();

/* Presentation only: offline production is credited once by session.js/resume(). */
// Display already-credited net changes; closing this dialog never grants additional materials.
function offlineNotice(result) {
  const changes = Object.entries(result.gains).filter(
    ([, amount]) => Math.abs(amount) >= 0.01,
  );
  const gains = changes.filter(([, amount]) => amount > 0);
  const consumed = changes.filter(([, amount]) => amount < 0);
  // Format positive and negative changes separately, keeping fractional offline amounts visible.
  function materialRows(entries, sign) {
    return entries
      .map(([key, amount]) => {
        const resource = G.resources[key];
        const quantity = Math.abs(amount).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
        return `<li><span class="mineral" style="--tone:${resource.color}">${resource.icon}</span><span>${resource.name}</span><strong>${sign}${quantity}</strong></li>`;
      })
      .join("");
  }
  modalReturn = $("map-button");
  openModal(`<p class="eyebrow">YOUR COLONIES KEPT BUSY</p>
    <h2 id="modal-title">Welcome back, commander.</h2>
    <p>${researchTime(result.seconds)} of offline production at 25% speed. Production is capped at eight hours away.</p>
    <p class="offline-explainer">These net changes are already saved in your inventory. Processing and fuel use are included.</p>
    ${gains.length ? `<h3>Materials gained</h3><ul class="offline-materials">${materialRows(gains, "+")}</ul>` : "<p>No materials accumulated while you were away.</p>"}
    ${consumed.length ? `<h3>Materials consumed</h3><ul class="offline-materials consumed">${materialRows(consumed, "−")}</ul>` : ""}
    <p>Research and fleet travel continue at full speed during the same offline period.</p>
    <button id="offline-continue" class="primary">Back to the colony ↗</button>`);
  $("offline-continue").onclick = closeModal;
}

// Dismiss the splash once, enable the game controls and show any pending offline receipt.
function enterGame() {
  if (!startupPending) return;
  startupPending = false;
  $("splash").hidden = true;
  document.querySelector("header").inert = false;
  document.querySelector("main").inert = false;
  if (state.started && welcome.seconds >= 60) offlineNotice(welcome);
  else (state.started ? $("map-button") : $("launch")).focus();
}

// Prevent keyboard and touch input reaching game controls underneath the splash.
document.querySelector("header").inert = true;
document.querySelector("main").inert = true;
$("enter-game").textContent = state.started
  ? "Continue your journey ↗"
  : "Begin your journey ↗";
$("enter-game").onclick = enterGame;
$("enter-game").focus();

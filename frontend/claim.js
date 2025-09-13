document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("claimForm");
  const message = document.getElementById("message");
  const claimId = new URLSearchParams(window.location.search).get("claimId");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const contactNumber = document.getElementById("contactNumber").value;
    const feedback = document.getElementById("feedback").value;

    const qrEntry = {
      qrId: claimId,
      category: "Sample Category", // Replace with actual category
      rewardType: "Sample Reward", // Replace with actual reward type
      generatedAt: new Date().toISOString(),
      claimed: "Yes",
      claimedAt: new Date().toISOString(),
      contactNumber,
      feedback
    };

    // POST to Google Sheet
    fetch("https://script.google.com/macros/s/AKfycbyXt22oqWU--mqyhgpeDwuHKEE-tPac0p0sk1i2e4Q0fvrSzW-bPyEm_n95FC0U2a2a/exec", {
      method: "POST",
      body: JSON.stringify(qrEntry),
      headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Claim saved:", data);
      // Show thank you message
      form.classList.add("hidden");
      message.innerHTML = "✅ Claim submitted! Our team will contact you soon.";
    })
    .catch(err => {
      console.error(err);
      message.innerHTML = "❌ Something went wrong. Please try again.";
    });
  });
});

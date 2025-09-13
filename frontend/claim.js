document.addEventListener("DOMContentLoaded", () => {
  const rewardTitle = document.getElementById("rewardTitle");
  const form = document.getElementById("claimForm");
  const message = document.getElementById("message");
  const contactInput = document.getElementById("contactNumber");
  const feedbackInput = document.getElementById("feedback");

  // Get QR parameters from URL
  const params = new URLSearchParams(window.location.search);
  const claimId = params.get("claimId");

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQe8-KX29q0owOQJKYQPYe8gpjsFp44k7rzKfmL_KrSrqfUhsuy1YoLoExUNmHGZ9E/exec"; // replace with your Apps Script URL

  async function fetchReward() {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?qrId=${claimId}`);
      const data = await res.json();

      if (data.error) {
        rewardTitle.textContent = "QR code not found or expired.";
        return;
      }

      rewardTitle.textContent = `Congratulations! You won a ${data.rewardType} 🎉`;
      form.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      rewardTitle.textContent = "Failed to load reward. Try again later.";
    }
  }

  fetchReward();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contactNumber = contactInput.value.trim();
    const feedback = feedbackInput.value.trim();

    if (!contactNumber) {
      alert("Please enter your contact number.");
      return;
    }

    const qrEntry = {
      qrId: claimId,
      claimed: "Yes",
      claimedAt: new Date().toISOString(),
      contactNumber,
      feedback
    };

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(qrEntry),
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();

      if (result.status === "ok") {
        form.classList.add("hidden");
        message.innerHTML = "✅ Claim submitted! Our team will contact you soon.";
      } else {
        message.innerHTML = "❌ Something went wrong. Please try again.";
      }
    } catch (err) {
      console.error(err);
      message.innerHTML = "❌ Failed to submit claim. Please try again.";
    }
  });
});

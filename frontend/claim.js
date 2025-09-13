document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const claimId = params.get("id");
  const category = params.get("category");

  const rewardTitle = document.getElementById("rewardTitle");
  const form = document.getElementById("claimForm");
  const message = document.getElementById("message");

  if (!claimId || !category) {
    rewardTitle.innerText = "Invalid QR code";
    return;
  }

  // Show reward info
  rewardTitle.innerText = `🎉 You won a ${category.toUpperCase()} reward!`;
  form.classList.remove("hidden");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const contactNumber = document.getElementById("contactNumber").value;
    const feedback = document.getElementById("feedback").value;

    // Update dataset
    const qrEntry = window.qrDataset.find(q => q.qrId === claimId);
    if (qrEntry) {
      qrEntry.claimed = "Yes";
      qrEntry.claimedAt = new Date().toISOString();
      qrEntry.deliveryInfo = contactNumber; // store contact number
      qrEntry.feedback = feedback;
    }

    // Hide form and show confirmation message
    form.classList.add("hidden");
    message.innerHTML = `
      ✅ Claim submitted!<br>
      Our team will contact you soon to deliver your reward.
    `;

    console.log("Updated QR dataset:", qrEntry);
  });
});

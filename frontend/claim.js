document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const rewardTitle = document.getElementById("rewardTitle");
  const form = document.getElementById("claimForm");
  const message = document.getElementById("message");

  if (!id) {
    rewardTitle.innerText = "Invalid QR code";
    return;
  }

  try {
    const r = await fetch(`https://your-backend-domain.com/api/rewards/${id}`);
    const data = await r.json();

    if (!r.ok) {
      rewardTitle.innerText = data.error || "Reward not found";
      return;
    }

    rewardTitle.innerText = `🎉 You won: ${data.reward_type}`;
    form.classList.remove("hidden");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const claim = {
        claimId: id,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        consent: document.getElementById("consent").checked
      };

      const res = await fetch("https://your-backend-domain.com/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claim)
      });

      const json = await res.json();
      if (res.ok) {
        form.classList.add("hidden");
        message.innerText = "✅ Claim submitted! We will contact you soon.";
      } else {
        message.innerText = "❌ " + (json.error || "Submission failed.");
      }
    });
  } catch (err) {
    rewardTitle.innerText = "Error loading reward.";
  }
});

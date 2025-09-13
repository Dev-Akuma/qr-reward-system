document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const downloadZipBtn = document.getElementById("downloadZipBtn");
  const loadingDiv = document.getElementById("loading");
  const downloadArea = document.getElementById("downloadArea");
  const previewArea = document.getElementById("previewArea");
  const categorySelect = document.getElementById("category");
  const countInput = document.getElementById("count");

  let zip;

  // 🔧 Helper: Convert base64 string → Blob
  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  // 🔧 Helper: generate QR code base64 from URL
  const createQrCode = (url) => {
    return new Promise((resolve) => {
      const tempDiv = document.createElement("div");
      new QRCode(tempDiv, {
        text: url,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      setTimeout(() => {
        const canvas = tempDiv.querySelector("canvas");
        resolve(canvas ? canvas.toDataURL("image/png") : null);
      }, 20);
    });
  };

  generateBtn.addEventListener("click", async () => {
    const category = categorySelect.value;
    const count = parseInt(countInput.value);

    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid count.");
      return;
    }

    loadingDiv.classList.remove("hidden");
    downloadArea.classList.add("hidden");
    previewArea.classList.add("hidden");
    previewArea.innerHTML = "";
    generateBtn.disabled = true;

    zip = new JSZip();

    for (let i = 0; i < count; i++) {
      try {
        // 🔑 Ask backend to create reward entry
        const resp = await fetch("https://your-backend-domain.com/api/rewards/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            reward_type: "Customer Reward"
          })
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Server error");

        const url = data.claimUrl;
        const claimId = data.claimId;

        const base64Url = await createQrCode(url);

        if (base64Url) {
          // Show preview
          const img = document.createElement("img");
          img.src = base64Url;
          img.className = "w-full h-auto rounded-lg shadow-md";
          previewArea.appendChild(img);

          // Save to ZIP (fixed conversion)
          const blob = base64ToBlob(base64Url, "image/png");
          zip.file(`qr-${category}-${claimId}.png`, blob);
        }
      } catch (err) {
        console.error("QR generation failed:", err);
      }
    }

    console.log("Files in zip:", Object.keys(zip.files)); // Debug check

    loadingDiv.classList.add("hidden");
    downloadArea.classList.remove("hidden");
    previewArea.classList.remove("hidden");
    generateBtn.disabled = false;
  });

  downloadZipBtn.addEventListener("click", async () => {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "rewards_qrcodes.zip");
  });
});

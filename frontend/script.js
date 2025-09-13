document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const downloadZipBtn = document.getElementById("downloadZipBtn");
  const downloadCSVBtn = document.getElementById("downloadCSVBtn");
  const loadingDiv = document.getElementById("loading");
  const downloadArea = document.getElementById("downloadArea");
  const previewArea = document.getElementById("previewArea");
  const categorySelect = document.getElementById("category");
  const countInput = document.getElementById("count");

  let zip;
  const qrDataset = []; // store QR codes + minimal info

  // Convert base64 to Blob
  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  }

  // Generate QR Code and return Base64
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

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  // Generate QR Codes
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
      const claimId = generateUniqueId();
      const url = `https://qr-reward-system-2ojjghaj8-mayengbam-devasis-singhs-projects.vercel.app/?id=${claimId}&category=${category}`;

      const base64Url = await createQrCode(url);
      if (base64Url) {
        // Show preview
        const img = document.createElement("img");
        img.src = base64Url;
        img.className = "w-full h-auto rounded-lg shadow-md";
        previewArea.appendChild(img);

        // Add to ZIP
        const blob = base64ToBlob(base64Url, "image/png");
        zip.file(`qr-${category}-${claimId}.png`, blob);

        // Add to dataset
        qrDataset.push({
          qrId: claimId,
          category,
          rewardType: `Reward for ${category}`,
          generatedAt: new Date().toISOString(),
          claimed: "No",
          claimedAt: "",
          deliveryInfo: "",
          feedback: ""
        });
      }
    }

    console.log("Files in zip:", Object.keys(zip.files));
    loadingDiv.classList.add("hidden");
    downloadArea.classList.remove("hidden");
    previewArea.classList.remove("hidden");
    generateBtn.disabled = false;
  });

  // Download ZIP of QR Codes
  downloadZipBtn.addEventListener("click", async () => {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "qr_rewards.zip");
  });

  // Download CSV Dataset
  downloadCSVBtn.addEventListener("click", () => {
    if (!qrDataset.length) {
      alert("No QR data to download!");
      return;
    }

    const headers = Object.keys(qrDataset[0]);
    const csvRows = [headers.join(",")];
    qrDataset.forEach(row => {
      const values = headers.map(h => `"${row[h]}"`);
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    saveAs(blob, "qr_dataset.csv");
  });

  // Expose dataset globally so claim.js can access it
  window.qrDataset = qrDataset;
});

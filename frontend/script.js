document.addEventListener("DOMContentLoaded", () => {
const generateBtn = document.getElementById("generateBtn");
const downloadZipBtn = document.getElementById("downloadZipBtn");
const downloadCSVBtn = document.getElementById("downloadCSVBtn");
const loadingDiv = document.getElementById("loading");
const previewArea = document.getElementById("previewArea");
const downloadArea = document.getElementById("downloadArea");
const categorySelect = document.getElementById("category");
const countInput = document.getElementById("count");

let zip;
const qrDataset = [];

function base64ToBlob(base64, mime) {
const byteChars = atob(base64.split(",")[1]);
const byteNumbers = new Array(byteChars.length);
for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
return new Blob([new Uint8Array(byteNumbers)], { type: mime });
}

const createQrCode = (url) => new Promise(resolve => {
const tempDiv = document.createElement("div");
new QRCode(tempDiv, { text: url, width: 256, height: 256 });
setTimeout(() => {
const canvas = tempDiv.querySelector("canvas");
resolve(canvas ? canvas.toDataURL("image/png") : null);
}, 20);
});

function generateUniqueId() {
return Date.now().toString(36) + Math.random().toString(36).substring(2,7);
}

generateBtn.addEventListener("click", async () => {
const category = categorySelect.value;
const count = parseInt(countInput.value);
if (isNaN(count) || count <= 0) { alert("Invalid count"); return; }

loadingDiv.classList.remove("hidden");
previewArea.classList.add("hidden");
previewArea.innerHTML = "";
downloadArea.classList.add("hidden");
generateBtn.disabled = true;
zip = new JSZip();

for (let i=0;i<count;i++){
const claimId = generateUniqueId();
const url = `https://qr-reward-system.vercel.app/claim.html?claimId=${claimId}&category=${category}`;
const base64Url = await createQrCode(url);

if(base64Url){
const img = document.createElement("img"); img.src = base64Url;
img.className = "w-full h-auto rounded-lg shadow-md"; previewArea.appendChild(img);

zip.file(`qr-${category}-${claimId}.png`, base64ToBlob(base64Url,"image/png"));

qrDataset.push({qrId: claimId, category, rewardType:`Reward for ${category}`,
generatedAt:new Date().toISOString(), claimed:"No", claimedAt:"", contactNumber:"", feedback:""});
}
}

loadingDiv.classList.add("hidden");
previewArea.classList.remove("hidden");
downloadArea.classList.remove("hidden");
generateBtn.disabled=false;
});

downloadZipBtn.addEventListener("click", async () => {
const content = await zip.generateAsync({type:"blob"}); saveAs(content,"qr_rewards.zip");
});

downloadCSVBtn.addEventListener("click", () => {
if(!qrDataset.length){ alert("No data"); return; }
const headers = Object.keys(qrDataset[0]);
const csvRows = [headers.join(",")];
qrDataset.forEach(row=>{ csvRows.push(headers.map(h=>`"${row[h]}"`).join(",")); });
const blob = new Blob([csvRows.join("\n")],{type:"text/csv"});
saveAs(blob,"qr_dataset.csv");
});
window.qrDataset = qrDataset;
});

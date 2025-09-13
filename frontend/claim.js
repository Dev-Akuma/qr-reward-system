document.addEventListener("DOMContentLoaded",()=>{
const rewardTitle=document.getElementById("rewardTitle");
const form=document.getElementById("claimForm");
const message=document.getElementById("message");

const params=new URLSearchParams(window.location.search);
const claimId=params.get("claimId");
const category=params.get("category")||"Reward";

rewardTitle.textContent=`Congratulations! You won a ${category} reward 🎉`;
form.classList.remove("hidden");

form.addEventListener("submit",(e)=>{
e.preventDefault();
const contactNumber=document.getElementById("contactNumber").value;
const feedback=document.getElementById("feedback").value;

const qrEntry={
qrId:claimId, category, rewardType:`Reward for ${category}`,
generatedAt:new Date().toISOString(),
claimed:"Yes",
claimedAt:new Date().toISOString(),
contactNumber, feedback
};

fetch("YOUR_GOOGLE_SCRIPT_URL",{
method:"POST",
body:JSON.stringify(qrEntry),
headers:{"Content-Type":"application/json"}
})
.then(res=>res.json())
.then(data=>{
form.classList.add("hidden");
message.innerHTML="✅ Claim submitted! Our team will contact you soon.";
})
.catch(err=>{
console.error(err);
message.innerHTML="❌ Something went wrong. Please try again.";
});
});
});

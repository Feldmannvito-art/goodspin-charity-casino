const charities = [
  {id:"kinder", icon:"🧒", name:"Kinder & Bildung", sub:"Bildungschancen für Kinder"},
  {id:"umwelt", icon:"🌱", name:"Umweltschutz", sub:"Natur- und Klimaschutzprojekte"},
  {id:"tiere", icon:"🐾", name:"Tierschutz", sub:"Schutz und Versorgung von Tieren"},
  {id:"hilfe", icon:"🤝", name:"Nothilfe", sub:"Schnelle Hilfe in Krisengebieten"}
];

let balance = 1000;
let totalDonations = 2450;
let selected = null;
let spins = 0;
let paused = false;
const symbols = ["🍀","💎","⭐","🍋","🔔","7️⃣"];

const eur = n => n.toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const $ = id => document.getElementById(id);

function renderCharities(){
  $("charities").innerHTML = charities.map(c => `
    <label class="charity ${selected===c.id?"selected":""}">
      <input type="radio" name="charity" value="${c.id}" ${selected===c.id?"checked":""}>
      <span style="font-size:22px;margin-right:9px">${c.icon}</span>
      <span><span class="charity-title">${c.name}</span><span class="charity-sub">${c.sub}</span></span>
    </label>`).join("");
  document.querySelectorAll(".charity").forEach(el => el.addEventListener("click",()=>{
    selected = el.querySelector("input").value;
    renderCharities();
    updateButton();
  }));
}
function updateButton(){ $("spin").disabled = !selected || paused; }
function setBalance(){ $("balance").textContent = eur(balance); $("totalDonations").textContent = eur(totalDonations); }
function riskUpdate(){
  const score = Math.min(100, spins*11);
  $("meter").style.width = Math.max(18, score)+"%";
  if(score < 40){$("risk").textContent="NIEDRIG";$("risk").style.color="#247346";}
  else if(score < 70){$("risk").textContent="ERHÖHT";$("risk").style.color="#9a6b00";}
  else {$("risk").textContent="HOCH";$("risk").style.color="#a13d35";}
}
function spin(){
  if(!selected || paused) return;
  const bet = Number($("bet").value);
  if(balance < bet){ $("slotMessage").textContent="Nicht genug virtuelles Guthaben."; return; }
  balance -= bet;
  const rolls = [0,0,0].map(()=>symbols[Math.floor(Math.random()*symbols.length)]);
  ["r1","r2","r3"].forEach((id,i)=>$(id).textContent=rolls[i]);
  let payout=0;
  if(rolls[0]===rolls[1] && rolls[1]===rolls[2]) payout=bet*5;
  else if(rolls[0]===rolls[1] || rolls[1]===rolls[2] || rolls[0]===rolls[2]) payout=bet*1.5;
  balance += payout;
  const netLoss = Math.max(0, bet-payout);
  const donation = netLoss*.75;
  const platform = netLoss*.25;
  totalDonations += donation;
  spins++;
  $("loss").textContent=eur(netLoss);
  $("donation").textContent=eur(donation);
  $("platform").textContent=eur(platform);
  $("slotMessage").textContent = payout>0 ? `Gewinn: ${eur(payout)} · Nettoverlust: ${eur(netLoss)}` : `Kein Gewinn · ${eur(donation)} werden im Demo-Modell gespendet.`;
  const charity = charities.find(c=>c.id===selected);
  $("log").innerHTML = `<div class="log-line"><span>Letzte Runde · ${charity.icon} ${charity.name}</span><b>+ ${eur(donation)} Spende</b></div>` + $("log").innerHTML;
  setBalance(); riskUpdate();
  if(spins>=6){ $("slotMessage").textContent += "  Spielerschutz: Eine Pause wird empfohlen."; }
}
$("spin").addEventListener("click",spin);
$("pause").addEventListener("click",()=>{
  paused=true; updateButton(); $("slotMessage").textContent="Pause aktiviert. Das Spiel bleibt 30 Minuten gesperrt (Demo).";
  setTimeout(()=>{paused=false;updateButton();},5000);
});
$("privacy").addEventListener("click",()=>$("modal").classList.remove("hidden"));
$("close").addEventListener("click",()=>$("modal").classList.add("hidden"));
$("modal").addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")});
renderCharities(); setBalance(); updateButton(); riskUpdate();

// assets/js/orgMapping.js - CORRECTED VERSION
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("assets/config/orgMapping.json");
    const orgData = await response.json();
    console.log("✅ orgMapping.json loaded:", orgData);

    const approverSelect = document.getElementById("approver");
    const tribeSelect = document.getElementById("tribe");
    const squadSelect = document.getElementById("squad");

    // Clear existing options
    tribeSelect.innerHTML = '<option value="">Select Tribe</option>';
    squadSelect.innerHTML = '<option value="">Select Squad</option>';

    // ✅ Populate Tribe dropdown
    const tribes = [];
    orgData.forEach(entry => {
      Object.keys(entry.tribes).forEach(tribe => {
        if (!tribes.includes(tribe)) tribes.push(tribe);
      });
    });

    tribes.forEach(tribe => {
      const opt = document.createElement("option");
      opt.value = tribe;
      opt.textContent = tribe;
      tribeSelect.appendChild(opt);
    });

    console.log("✅ Tribes populated:", tribes);

    // ✅ When a tribe is selected → show squads
    tribeSelect.addEventListener("change", () => {
      const selectedTribe = tribeSelect.value;
      console.log("🔍 Tribe selected:", selectedTribe);
      
      // Clear squad dropdown
      squadSelect.innerHTML = '<option value="">Select Squad</option>';
      
      // FIXED: Don't reset approver here
      // approverSelect.value = ""; // REMOVED - This was the problem!

      if (!selectedTribe) return;

      const matchedEntry = orgData.find(entry =>
        Object.keys(entry.tribes).includes(selectedTribe)
      );

      if (matchedEntry) {
        console.log("✅ Found matching entry:", matchedEntry);
        
        // Populate squads
        matchedEntry.tribes[selectedTribe].forEach(sq => {
          const opt = document.createElement("option");
          opt.value = sq;
          opt.textContent = sq;
          squadSelect.appendChild(opt);
        });

        console.log("✅ Squads populated for tribe:", selectedTribe);
        
        // Auto-fill approver when tribe is selected
        approverSelect.value = matchedEntry.approver;
        console.log("✅ Auto-filled approver:", matchedEntry.approver);
      } else {
        console.log("❌ No matching entry found for tribe:", selectedTribe);
      }
    });

    // ✅ When a squad is selected → update approver if needed
    squadSelect.addEventListener("change", () => {
      const selectedTribe = tribeSelect.value;
      const selectedSquad = squadSelect.value;
      
      console.log("🔍 Squad selected:", selectedSquad, "from tribe:", selectedTribe);
      
      if (selectedTribe && selectedSquad) {
        const matchedEntry = orgData.find(entry =>
          Object.keys(entry.tribes).includes(selectedTribe) &&
          entry.tribes[selectedTribe].includes(selectedSquad)
        );
        
        if (matchedEntry) {
          approverSelect.value = matchedEntry.approver;
          console.log("✅ Updated approver for squad:", matchedEntry.approver);
        } else {
          console.log("❌ No approver found for squad:", selectedSquad);
        }
      }
    });

    console.log("✅ Tribe/Squad/Approver logic initialized");

  } catch (err) {
    console.error("❌ Failed to load orgMapping.json:", err);
    
    // Fallback hardcoded data for testing
    console.log("⚠️ Using fallback data");
    setupFallbackData();
  }
});

// Fallback function in case orgMapping.json fails to load
function setupFallbackData() {
  const approverSelect = document.getElementById("approver");
  const tribeSelect = document.getElementById("tribe");
  const squadSelect = document.getElementById("squad");

  // Clear existing options
  tribeSelect.innerHTML = '<option value="">Select Tribe</option>';
  squadSelect.innerHTML = '<option value="">Select Squad</option>';

  // Add some test tribes and squads
  const testData = [
    { tribe: "funds", squads: ["bank_cashin", "bank_transfer", "p2p_and_padala"], approver: "Abi Baltazar" },
    { tribe: "platform", squads: ["infrastructure", "security", "monitoring"], approver: "Platform Lead" }
  ];

  testData.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.tribe;
    opt.textContent = item.tribe;
    tribeSelect.appendChild(opt);
  });

  tribeSelect.addEventListener("change", () => {
    const selectedTribe = tribeSelect.value;
    squadSelect.innerHTML = '<option value="">Select Squad</option>';
    
    if (selectedTribe) {
      const tribeData = testData.find(t => t.tribe === selectedTribe);
      if (tribeData) {
        tribeData.squads.forEach(squad => {
          const opt = document.createElement("option");
          opt.value = squad;
          opt.textContent = squad;
          squadSelect.appendChild(opt);
        });
        approverSelect.value = tribeData.approver;
      }
    }
  });

  squadSelect.addEventListener("change", () => {
    const selectedTribe = tribeSelect.value;
    const selectedSquad = squadSelect.value;
    
    if (selectedTribe && selectedSquad) {
      const tribeData = testData.find(t => t.tribe === selectedTribe);
      if (tribeData) {
        approverSelect.value = tribeData.approver;
      }
    }
  });
}
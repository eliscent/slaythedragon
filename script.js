 const tasks = {
      easy: [
        ["Make your bed", "10"],
        ["Put dishes into the dishwasher or sink", "10"],
        ["Wipe down your desk", "10"],
        ["Take trash out", "10"],
        ["Drink a glass of water", "10"],
        ["Sort 3–5 items into their place", "10"],
        ["Put on a load of laundry", "15"],
        ["Take care of the plants", "10"],
        ["Take care of the pets", "10"],
        ["Take a short walk for fresh air", "15"]
      ],
      medium: [
        ["Kitchen counters", "20"],
        ["Do the dishes", "30"],
        ["Bathroom counters", "20"],
        ["Change bedsheets", "25"],
        ["Put laundry away", "25"],
        ["Cook a meal", "20"],
        ["Clear your desk", "20"],
        ["Scrub the toilet", "25"],
        ["Scrub the shower", "30"],
        ["Reorganize a drawer", "25"]
      ],
      hard: [
        ["Grocery shop + unpack", "35"],
        ["Clean kitchen (surfaces + dishes + stove)", "40"],
        ["Clean the fridge", "40"],
        ["Toss expired food (fridge and/or pantry)", "30"],
        ["Clean the oven", "40"],
        ["Clean the recycling bins", "30"],
        ["Deep-clean bathroom", "45"],
        ["Clean the windows (in one room)", "35"]
      ],
      aoe: [
        ["Wipe all surfaces", "25"],
        ["Open the windows for 20 minutes", "20"],
        ["Mop the floors", "45"],
        ["Vacuum the floors", "40"],
        ["Time Trial! (10 min speed clean)", "30"],
        ["Declutter an area", "35"],
        ["Choose your task!", "30"]
      ]
    };

    // 🐉 DRAGON HP LOGIC
    const maxHP = 300;
    let currentHP = maxHP;

    const hpFill = document.getElementById("hp-fill");
    const hpText = document.getElementById("hp-text");
    const resetDragonBtn = document.getElementById("reset-dragon");
    const dragonHpBox = document.getElementById("dragon-hp-box");

    function updateHPUI() {
      const percent = Math.max(0, (currentHP / maxHP) * 100);
      hpFill.style.width = percent + "%";

      if (currentHP <= 0) {
        hpFill.classList.add("defeated");
        hpText.textContent = "Dragon slain! 🎉";
        dragonHpBox.classList.add("shake");
        setTimeout(() => {
          dragonHpBox.classList.remove("shake");
        }, 400);
      } else {
        hpFill.classList.remove("defeated");
        hpText.textContent = `Dragon HP: ${currentHP} / ${maxHP}`;
      }
    }

    function resetDragon() {
      currentHP = maxHP;
      updateHPUI();
    }

    resetDragonBtn.addEventListener("click", resetDragon);

    // Shuffle helper
    function shuffle(array) {
      let currentIndex = array.length;
      while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ];
      }
      return array;
    }

    // Populate each table with up to 5 random tasks from the category
    for (const diff in tasks) {
      const tbody = document.getElementById(diff);
      if (!tbody) continue;

      const randomized = shuffle([...tasks[diff]]);
      const visibleTasks = randomized.slice(0, 5);

      tbody.innerHTML = visibleTasks
        .map(([task, dmg]) =>
          `<tr class="${diff}">
            <td>${task}</td>
            <td>${dmg}</td>
          </tr>`
        )
        .join("");
    }

    // Flatten tasks for dice randomizer
    const allTasks = Object.entries(tasks).flatMap(([difficulty, list]) =>
      list.map(([task, dmg]) => ({ difficulty, task, dmg }))
    );

    function getRandomTask() {
      const index = Math.floor(Math.random() * allTasks.length);
      return allTasks[index];
    }

    // Modal elements
    const modal = document.getElementById("quest-modal");
    const questTitle = document.getElementById("quest-title");
    const questText = document.getElementById("quest-text");
    const questDamage = document.getElementById("quest-damage");
    const questBadge = document.getElementById("quest-badge");

    const btnRoll = document.getElementById("roll-btn");
    const btnAccept = document.getElementById("btn-accept");
    const btnReroll = document.getElementById("btn-reroll");
    const btnDone = document.getElementById("btn-done");
    const btnCancel = document.getElementById("btn-cancel");

    let currentQuest = null;
    let questAccepted = false;

    function showButtonsInitial() {
      btnAccept.classList.remove("hidden");
      btnReroll.classList.remove("hidden");
      btnDone.classList.add("hidden");
      btnCancel.classList.add("hidden");
    }

    function showButtonsAccepted() {
      btnAccept.classList.add("hidden");
      btnReroll.classList.add("hidden");
      btnDone.classList.remove("hidden");
      btnCancel.classList.remove("hidden");
    }

    function openModal() {
      if (!currentQuest) return;
      modal.classList.remove("hidden");
    }

    function closeModal() {
      modal.classList.add("hidden");
    }

    function renderQuest(taskObj, mode = "offer") {
      const { difficulty, task, dmg } = taskObj;

      questBadge.innerHTML = `<span class="badge ${difficulty}">${difficulty === "aoe" ? "CRITICAL" : difficulty.toUpperCase()}</span>`;

      if (mode === "offer") {
        questTitle.textContent = "New quest!";
        questText.textContent = `You rolled: "${task}".`;
        questDamage.textContent = `Reward: ${dmg} HP damage to the dragon.`;
        showButtonsInitial();
      } else if (mode === "accepted") {
        questTitle.textContent = "Quest accepted!";
        questText.textContent = `You start your quest: "${task}".`;
        questDamage.textContent = `Complete it to deal ${dmg} HP damage.`;
        showButtonsAccepted();
      }
    }

    function rollNewQuest() {
      currentQuest = getRandomTask();
      questAccepted = false;
      renderQuest(currentQuest, "offer");
      openModal();
    }

    // Button events
    btnRoll.addEventListener("click", () => {
      rollNewQuest();
    });

    btnReroll.addEventListener("click", () => {
      rollNewQuest();
    });

    btnAccept.addEventListener("click", () => {
      if (!currentQuest) return;
      questAccepted = true;
      renderQuest(currentQuest, "accepted");
    });

    btnDone.addEventListener("click", () => {
      if (!currentQuest) return;

      const dmg = parseInt(currentQuest.dmg, 10);
      if (!isNaN(dmg) && currentHP > 0) {
        currentHP = Math.max(0, currentHP - dmg);
        updateHPUI();
      }

      closeModal();
      currentQuest = null;
      questAccepted = false;
    });

    btnCancel.addEventListener("click", () => {
      rollNewQuest();
    });

    // Outside click closes modal only if quest NOT accepted
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        if (!questAccepted) {
          closeModal();
          currentQuest = null;
        }
      }
    });

    // Initialize HP UI on load
    updateHPUI();
/**
 * ==============================================================================
 * FitBuddy – Frontend Client Logic (script.js)
 * ==============================================================================
 * Description: Handles interactive form validation, API communication with the
 *              backend Express server, dynamic rendering of AI fitness plans,
 *              printing/copying, and responsive UI navigation.
 * Author: BCA 1st Year Project Template
 * ==============================================================================
 */

// Run when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {

  // --- Element Selectors ---
  const fitnessForm = document.getElementById('fitnessForm');
  const submitBtn = document.getElementById('submitBtn');
  const demoBtn = document.getElementById('demoBtn');
  const formAlert = document.getElementById('formAlert');
  const loadingSection = document.getElementById('loadingSection');
  const loadingTip = document.getElementById('loadingTip');
  const resultSection = document.getElementById('resultSection');

  // Result display selectors
  const planTitle = document.getElementById('planTitle');
  const planSummary = document.getElementById('planSummary');
  const userOverviewChips = document.getElementById('userOverviewChips');
  const warmupContainer = document.getElementById('warmupContainer');
  const scheduleContainer = document.getElementById('scheduleContainer');
  const cooldownContainer = document.getElementById('cooldownContainer');
  const nutritionContainer = document.getElementById('nutritionContainer');
  const safetyText = document.getElementById('safetyText');

  // Action buttons
  const printPlanBtn = document.getElementById('printPlanBtn');
  const copyPlanBtn = document.getElementById('copyPlanBtn');
  const resetPlanBtn = document.getElementById('resetPlanBtn');
  const generateAnotherBtn = document.getElementById('generateAnotherBtn');

  // Navigation selectors
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  // Stores currently generated plan data for copying/printing
  let currentPlanData = null;

  // Interval timer for rotating loading tips
  let tipIntervalId = null;

  // List of encouraging fitness tips displayed during AI generation
  const loadingTips = [
    "Analyzing your current fitness level and target goal...",
    "Selecting scientifically proven exercises for balanced muscle development...",
    "Customizing sets, rep ranges, and rest intervals to avoid fatigue...",
    "Structuring dynamic warm-up drills to prepare your joints...",
    "Curating cool-down stretches to speed up muscle recovery...",
    "Assembling nutritious meal ideas tailored to your diet...",
    "Finalizing your safe, personalized weekly schedule..."
  ];

  // ============================================================
  // 1. MOBILE NAVIGATION & ACTIVE LINK HIGHLIGHTING
  // ============================================================
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close mobile menu when any navigation link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // ============================================================
  // 2. CHECK SERVER & GEMINI CONFIGURATION STATUS ON LOAD
  // ============================================================
  async function checkServerStatus() {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        if (!data.geminiConfigured) {
          showAlert(
            '💡 Welcome! To generate real AI plans, please add your free Gemini API key to the .env file. (See README for instructions).',
            'alert-warning'
          );
        }
      }
    } catch (err) {
      console.warn('Backend server status check failed:', err);
    }
  }
  checkServerStatus();

  // ============================================================
  // 3. FORM VALIDATION
  // ============================================================
  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    hideAlert();
  }

  function validateForm() {
    clearFieldErrors();
    let isValid = true;

    // Validate Name
    const nameInput = document.getElementById('userName');
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      document.getElementById('nameError').textContent = 'Please enter your full name.';
      isValid = false;
    } else if (nameVal.length < 2) {
      document.getElementById('nameError').textContent = 'Name must be at least 2 characters long.';
      isValid = false;
    }

    // Validate Age
    const ageInput = document.getElementById('userAge');
    const ageVal = parseInt(ageInput.value, 10);
    if (isNaN(ageVal)) {
      document.getElementById('ageError').textContent = 'Please enter your age.';
      isValid = false;
    } else if (ageVal < 10 || ageVal > 100) {
      document.getElementById('ageError').textContent = 'Please enter a valid age between 10 and 100.';
      isValid = false;
    }

    // Validate Available Days (At least 2 days recommended)
    const selectedDays = Array.from(
      fitnessForm.querySelectorAll('input[name="availableDays"]:checked')
    ).map(cb => cb.value);

    if (selectedDays.length < 2) {
      document.getElementById('daysError').textContent = 'Please select at least 2 available workout days.';
      isValid = false;
    }

    return isValid;
  }

  // ============================================================
  // 4. ALERT MESSAGES (Success, Warning, Danger)
  // ============================================================
  function showAlert(message, type = 'alert-danger') {
    formAlert.className = `alert-box ${type}`;
    formAlert.textContent = message;
    formAlert.style.display = 'block';
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideAlert() {
    formAlert.style.display = 'none';
    formAlert.textContent = '';
  }

  // ============================================================
  // 5. LOADING STATE & ROTATING TIPS
  // ============================================================
  function startLoading() {
    hideAlert();
    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.querySelector('.btn-text').textContent = 'Generating Plan...';

    // Scroll smoothly to loading section
    loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Rotate encouraging tips every 2.5 seconds
    let tipIndex = 0;
    loadingTip.textContent = loadingTips[0];
    tipIntervalId = setInterval(() => {
      tipIndex = (tipIndex + 1) % loadingTips.length;
      loadingTip.textContent = loadingTips[tipIndex];
    }, 2500);
  }

  function stopLoading() {
    loadingSection.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.querySelector('.btn-text').textContent = 'Generate My Fitness Plan';

    if (tipIntervalId) {
      clearInterval(tipIntervalId);
      tipIntervalId = null;
    }
  }

  // ============================================================
  // 6. FORM SUBMISSION & BACKEND API CALL
  // ============================================================
  fitnessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Run client-side validation
    if (!validateForm()) {
      return;
    }

    // 2. Collect form values
    const formData = {
      name: document.getElementById('userName').value.trim(),
      age: document.getElementById('userAge').value.trim(),
      goal: fitnessForm.querySelector('input[name="goal"]:checked')?.value || 'General Fitness',
      fitnessLevel: fitnessForm.querySelector('input[name="fitnessLevel"]:checked')?.value || 'Beginner',
      workoutDuration: fitnessForm.querySelector('input[name="workoutDuration"]:checked')?.value || '30 minutes',
      dietPreference: fitnessForm.querySelector('input[name="dietPreference"]:checked')?.value || 'Vegetarian',
      availableDays: Array.from(
        fitnessForm.querySelectorAll('input[name="availableDays"]:checked')
      ).map(cb => cb.value),
      additionalPreferences: document.getElementById('additionalPreferences').value.trim()
    };

    // 3. Initiate loading animation
    startLoading();

    try {
      // 4. Send request to Express backend
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      stopLoading();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate plan. Please try again.');
      }

      // 5. Render received AI fitness plan
      currentPlanData = result.data;
      renderFitnessPlan(result.data);

    } catch (error) {
      stopLoading();
      console.error('Plan generation error:', error);
      showAlert(error.message, 'alert-danger');
    }
  });

  // Handle instant demo preview
  if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
      // Auto-fill friendly default values if name/age are empty
      const nameInput = document.getElementById('userName');
      if (!nameInput.value.trim()) {
        nameInput.value = 'Alex Rivera';
      }
      const ageInput = document.getElementById('userAge');
      if (!ageInput.value.trim()) {
        ageInput.value = '21';
      }

      const formData = {
        name: nameInput.value.trim(),
        age: ageInput.value.trim(),
        goal: fitnessForm.querySelector('input[name="goal"]:checked')?.value || 'General Fitness',
        fitnessLevel: fitnessForm.querySelector('input[name="fitnessLevel"]:checked')?.value || 'Beginner',
        workoutDuration: fitnessForm.querySelector('input[name="workoutDuration"]:checked')?.value || '30 minutes',
        dietPreference: fitnessForm.querySelector('input[name="dietPreference"]:checked')?.value || 'Vegetarian',
        availableDays: Array.from(
          fitnessForm.querySelectorAll('input[name="availableDays"]:checked')
        ).map(cb => cb.value),
        additionalPreferences: document.getElementById('additionalPreferences').value.trim(),
        isDemo: true
      };

      startLoading();

      try {
        const response = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();
        stopLoading();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to generate demo plan.');
        }

        currentPlanData = result.data;
        renderFitnessPlan(result.data);
      } catch (err) {
        stopLoading();
        console.error('Demo plan error:', err);
        showAlert(err.message, 'alert-danger');
      }
    });
  }

  // ============================================================
  // 7. RENDER PLAN DETAILS TO THE UI
  // ============================================================
  function renderFitnessPlan(plan) {
    if (!plan) return;

    // A. Title & Summary
    planTitle.textContent = plan.planTitle || 'Your Personalized Fitness Plan';
    planSummary.textContent = plan.summary || 'Here is your custom weekly routine tailored for wellness and longevity.';

    // B. User Overview Chips
    const overview = plan.userOverview || {};
    userOverviewChips.innerHTML = `
      <div class="profile-chip">
        <span class="chip-label">👤 User:</span>
        <span class="chip-value">${escapeHtml(overview.name || 'Friend')} (${overview.age || ''} yrs)</span>
      </div>
      <div class="profile-chip">
        <span class="chip-label">🎯 Goal:</span>
        <span class="chip-value">${escapeHtml(overview.goal || 'General Fitness')}</span>
      </div>
      <div class="profile-chip">
        <span class="chip-label">⚡ Level:</span>
        <span class="chip-value">${escapeHtml(overview.level || 'Beginner')}</span>
      </div>
      <div class="profile-chip">
        <span class="chip-label">⏱️ Session:</span>
        <span class="chip-value">${escapeHtml(overview.duration || '30 minutes')}</span>
      </div>
      <div class="profile-chip">
        <span class="chip-label">🥦 Diet:</span>
        <span class="chip-value">${escapeHtml(overview.diet || 'Vegetarian')}</span>
      </div>
      <div class="profile-chip">
        <span class="chip-label">📅 Days:</span>
        <span class="chip-value">${escapeHtml(overview.days || 'Flexible')}</span>
      </div>
    `;

    // C. Dynamic Warm-Up Routine
    warmupContainer.innerHTML = '';
    if (Array.isArray(plan.warmup) && plan.warmup.length > 0) {
      plan.warmup.forEach(item => {
        const box = document.createElement('div');
        box.className = 'routine-item-box';
        box.innerHTML = `
          <div class="routine-item-header">
            <span class="routine-item-name">${escapeHtml(item.name || 'Warm-up Drill')}</span>
            <span class="routine-item-duration">${escapeHtml(item.duration || '1-2 mins')}</span>
          </div>
          <p class="routine-item-tip">${escapeHtml(item.tip || 'Focus on smooth, controlled joint movement.')}</p>
        `;
        warmupContainer.appendChild(box);
      });
    } else {
      warmupContainer.innerHTML = '<p class="text-muted">5-10 minutes of light dynamic stretching (Arm circles, torso twists, leg swings).</p>';
    }

    // D. Weekly Workout Schedule
    scheduleContainer.innerHTML = '';
    if (Array.isArray(plan.weeklySchedule) && plan.weeklySchedule.length > 0) {
      plan.weeklySchedule.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-schedule-card';

        // Build exercises table rows
        let exercisesRowsHtml = '';
        if (Array.isArray(day.exercises)) {
          day.exercises.forEach(ex => {
            exercisesRowsHtml += `
              <tr>
                <td>
                  <span class="exercise-name">${escapeHtml(ex.name || 'Exercise')}</span>
                </td>
                <td>
                  <span class="exercise-sets">${escapeHtml(ex.setsAndReps || '3 sets x 10 reps')}</span>
                </td>
                <td>
                  <span>${escapeHtml(ex.rest || '60s')}</span>
                </td>
                <td>
                  <span class="exercise-tip">${escapeHtml(ex.formTip || 'Maintain proper posture and steady breathing.')}</span>
                </td>
              </tr>
            `;
          });
        }

        dayCard.innerHTML = `
          <div class="day-schedule-header">
            <span class="day-name">${escapeHtml(day.dayName || 'Workout Session')}</span>
            <span class="day-focus-pill">${escapeHtml(day.focus || 'Full Body Strength')}</span>
          </div>
          <div class="table-responsive">
            <table class="exercise-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Exercise</th>
                  <th style="width: 26%;">Sets & Reps / Duration</th>
                  <th style="width: 16%;">Rest</th>
                  <th style="width: 26%;">Form & Coaching Tip</th>
                </tr>
              </thead>
              <tbody>
                ${exercisesRowsHtml}
              </tbody>
            </table>
          </div>
        `;
        scheduleContainer.appendChild(dayCard);
      });
    }

    // E. Cool-Down Routine
    cooldownContainer.innerHTML = '';
    if (Array.isArray(plan.cooldown) && plan.cooldown.length > 0) {
      plan.cooldown.forEach(item => {
        const box = document.createElement('div');
        box.className = 'routine-item-box';
        box.innerHTML = `
          <div class="routine-item-header">
            <span class="routine-item-name">${escapeHtml(item.name || 'Cool-down Stretch')}</span>
            <span class="routine-item-duration">${escapeHtml(item.duration || '2 mins')}</span>
          </div>
          <p class="routine-item-tip">${escapeHtml(item.tip || 'Breathe deeply and gently hold the stretch without bouncing.')}</p>
        `;
        cooldownContainer.appendChild(box);
      });
    } else {
      cooldownContainer.innerHTML = '<p class="text-muted">5 minutes of static stretches focusing on hamstrings, quads, chest, and back.</p>';
    }

    // F. Nutrition & Wellness Guidelines
    nutritionContainer.innerHTML = '';
    if (Array.isArray(plan.nutritionWellness) && plan.nutritionWellness.length > 0) {
      plan.nutritionWellness.forEach((tip, idx) => {
        const icons = ['🥗', '💧', '🍎', '🥑', '🥣', '⚡'];
        const icon = icons[idx % icons.length];

        const item = document.createElement('div');
        item.className = 'nutrition-item';
        item.innerHTML = `
          <span class="nutrition-icon">${icon}</span>
          <p class="nutrition-text">${escapeHtml(tip)}</p>
        `;
        nutritionContainer.appendChild(item);
      });
    }

    // G. Safety Reminder
    if (plan.safetyReminder) {
      safetyText.textContent = plan.safetyReminder;
    }

    // Display the result section & scroll into view smoothly
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ============================================================
  // 8. ACTIONS: PRINT, COPY & RESET PLAN
  // ============================================================

  // Print or Save as PDF
  if (printPlanBtn) {
    printPlanBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy Plan as Clean Formatted Text
  if (copyPlanBtn) {
    copyPlanBtn.addEventListener('click', async () => {
      if (!currentPlanData) return;

      const p = currentPlanData;
      let text = `FITBUDDY AI FITNESS PLAN\n`;
      text += `=========================================\n`;
      text += `Title: ${p.planTitle || 'Fitness Plan'}\n`;
      text += `Summary: ${p.summary || ''}\n\n`;

      if (p.userOverview) {
        text += `PROFILE OVERVIEW:\n`;
        text += `- Goal: ${p.userOverview.goal}\n`;
        text += `- Level: ${p.userOverview.level}\n`;
        text += `- Duration: ${p.userOverview.duration}\n`;
        text += `- Diet: ${p.userOverview.diet}\n\n`;
      }

      if (Array.isArray(p.warmup)) {
        text += `WARM-UP ROUTINE:\n`;
        p.warmup.forEach(w => text += `• ${w.name} (${w.duration}) - ${w.tip}\n`);
        text += `\n`;
      }

      if (Array.isArray(p.weeklySchedule)) {
        text += `WEEKLY SCHEDULE:\n`;
        p.weeklySchedule.forEach(day => {
          text += `\n[${day.dayName}] - Focus: ${day.focus}\n`;
          if (Array.isArray(day.exercises)) {
            day.exercises.forEach(ex => {
              text += `  • ${ex.name} | ${ex.setsAndReps} | Rest: ${ex.rest} | Tip: ${ex.formTip}\n`;
            });
          }
        });
        text += `\n`;
      }

      if (Array.isArray(p.cooldown)) {
        text += `COOL-DOWN ROUTINE:\n`;
        p.cooldown.forEach(c => text += `• ${c.name} (${c.duration}) - ${c.tip}\n`);
        text += `\n`;
      }

      if (Array.isArray(p.nutritionWellness)) {
        text += `NUTRITION & WELLNESS:\n`;
        p.nutritionWellness.forEach(n => text += `• ${n}\n`);
        text += `\n`;
      }

      if (p.safetyReminder) {
        text += `SAFETY REMINDER:\n${p.safetyReminder}\n`;
      }

      try {
        await navigator.clipboard.writeText(text);
        const originalText = copyPlanBtn.textContent;
        copyPlanBtn.textContent = '✅ Copied to Clipboard!';
        setTimeout(() => {
          copyPlanBtn.textContent = originalText;
        }, 2500);
      } catch (err) {
        alert('Could not copy to clipboard automatically. You can use the Print button to save as PDF.');
      }
    });
  }

  // Reset / Generate New Plan buttons
  function resetToForm() {
    resultSection.style.display = 'none';
    document.getElementById('plan-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('userName').focus();
  }

  if (resetPlanBtn) {
    resetPlanBtn.addEventListener('click', resetToForm);
  }

  if (generateAnotherBtn) {
    generateAnotherBtn.addEventListener('click', resetToForm);
  }

  // ============================================================
  // 9. UTILITY: ESCAPE HTML TO PREVENT XSS
  // ============================================================
  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

});

// assets/js/app.js
// EcoTrack - simple client-side footprint calculator
(function () {
  'use strict';

  const form = document.getElementById('footprint-form');
  const resultText = document.getElementById('result-text');
  const formMessage = document.getElementById('form-message');
  const clearBtn = document.getElementById('clear');

  // Simple emission factors (educational/demo values)
  const FACTORS = {
    transportPerKm: 0.12,   // kg CO2 per km by car
    mealPerMeat: 2.5,       // kg CO2 per meat meal
    energyPerKwh: 0.3       // kg CO2 per kWh
  };

  function isPositiveNumber(value) {
    return !Number.isNaN(value) && value >= 0;
  }

  function validateInputs(transport, meals, energy) {
    let errors = [];
    if (!isPositiveNumber(transport)) errors.push('Transport must be 0 or a positive number');
    if (!Number.isInteger(meals) || meals < 0) errors.push('Meals must be 0 or a positive whole number');
    if (!isPositiveNumber(energy)) errors.push('Electricity must be 0 or a positive number');
    return errors;
  }

  function calculate(transportKm, mealsCount, energyKwh) {
    return transportKm * FACTORS.transportPerKm
         + mealsCount * FACTORS.mealPerMeat
         + energyKwh * FACTORS.energyPerKwh;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formMessage.textContent = '';

      const transport = parseFloat(document.getElementById('transport').value) || 0;
      const meals = parseFloat(document.getElementById('meals').value, 10) || 0;
      const energy = parseFloat(document.getElementById('electricity').value) || 0;

      const errors = validateInputs(transport, meals, energy);
      if (errors.length) {
        formMessage.textContent = errors.join('. ');
        resultText.textContent = 'Please fix the errors and try again.';
        return;
      }

      const total = calculate(transport, meals, energy);
      let feedback = '';
      if (total < 5) feedback = '🌍 Excellent — your footprint is low today.';
      else if (total < 15) feedback = '⚖️ Moderate — consider small changes to reduce it.';
      else feedback = '⚠️ High — consider swapping a car trip for walking/cycling or reducing meat meals.';

      resultText.innerHTML = `Estimated footprint: <strong>${total.toFixed(2)} kg CO₂</strong>. ${feedback}`;

      // store session (for demo persistence)
      try {
        const stored = JSON.parse(sessionStorage.getItem('ecotrack') || '[]');
        stored.push({ transport, meals, energy, total, ts: new Date().toISOString() });
        sessionStorage.setItem('ecotrack', JSON.stringify(stored));
      } catch (err) {
        // ignore storage errors (defensive)
        // console.error('Storage error', err);
      }
    });

    clearBtn.addEventListener('click', function () {
      form.reset();
      formMessage.textContent = '';
      resultText.textContent = 'Fill in the form and press Calculate to see your estimated footprint.';
    });

    // Populate any session data on load (optional)
    document.addEventListener('DOMContentLoaded', function () {
      try {
        const stored = JSON.parse(sessionStorage.getItem('ecotrack') || '[]');
        if (stored.length) {
          const last = stored[stored.length - 1];
          resultText.innerHTML = `Last session: <strong>${last.total.toFixed(2)} kg CO₂</strong> (saved in session).`;
        }
      } catch (err) { /* ignore */ }
    });
  }
})();
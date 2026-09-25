
let lastCalc = {};
document.addEventListener('DOMContentLoaded', () => {
  const billInput = document.getElementById('billInput');
  const billSlider = document.getElementById('billSlider');
  const rateInput = document.getElementById('rateInput');
  const rateSlider = document.getElementById('rateSlider');
  const sunInput = document.getElementById('sunInput');
  const sunSlider = document.getElementById('sunSlider');
  const costPerWattInput = document.getElementById('costPerWattInput');
  const costPerWattSlider = document.getElementById('costPerWattSlider');
  const itcToggle = document.getElementById('itcToggle');
  const batteryToggle = document.getElementById('batteryToggle');

  const paybackYears = document.getElementById('paybackYears');
  const paybackYearDate = document.getElementById('paybackYearDate');
  const systemSize = document.getElementById('systemSize');
  const netCost = document.getElementById('netCost');
  const taxCreditSavings = document.getElementById('taxCreditSavings');
  const twentyFiveYearSavings = document.getElementById('twentyFiveYearSavings');
  const formulaKwh = document.getElementById('formulaKwh');
  const formulaSun = document.getElementById('formulaSun');
  const formulaKw = document.getElementById('formulaKw');
  const badgeVerdict = document.getElementById('badgeVerdict');

  function calculate() {
    const bill = parseFloat(billInput?.value || 250);
    const rate = parseFloat(rateInput?.value || 0.16);
    const sunHours = parseFloat(sunInput?.value || 5.0);
    const costPerWatt = parseFloat(costPerWattInput?.value || 2.85);
    const itcEnabled = itcToggle ? itcToggle.checked : true;
    const hasBattery = batteryToggle ? batteryToggle.checked : false;

    // Sizing
    const monthlyKwh = bill / rate;
    const kwNeeded = monthlyKwh / (sunHours * 30 * 0.80);
    const panelCount = Math.ceil((kwNeeded * 1000) / 400);

    // Financials
    const grossSolarCost = kwNeeded * 1000 * costPerWatt;
    const batteryCost = hasBattery ? 10000 : 0;
    const totalGrossCost = grossSolarCost + batteryCost;
    const itcAmount = itcEnabled ? totalGrossCost * 0.30 : 0;
    const netOutCost = totalGrossCost - itcAmount;
    const annualSavingsYr1 = bill * 12;
    const payback = annualSavingsYr1 > 0 ? (netOutCost / annualSavingsYr1) : 0;
    const currentYear = new Date().getFullYear();
    const breakevenYear = Math.ceil(currentYear + payback);

    // 25-Year Compound Savings
    let cumSolar = -netOutCost;
    for (let yr = 1; yr <= 25; yr++) {
      const inflatedBill = annualSavingsYr1 * Math.pow(1.03, yr - 1);
      const degradedProduction = 1 - (yr - 1) * 0.005;
      cumSolar += (inflatedBill * degradedProduction);
    }

    if (paybackYears) paybackYears.textContent = payback.toFixed(1);
    if (paybackYearDate) paybackYearDate.textContent = breakevenYear;
    if (systemSize) systemSize.textContent = `${kwNeeded.toFixed(1)} kW (~${panelCount} Panels)`;
    if (netCost) netCost.textContent = '$' + Math.round(netOutCost).toLocaleString();
    if (taxCreditSavings) taxCreditSavings.textContent = '-$' + Math.round(itcAmount).toLocaleString();
    if (twentyFiveYearSavings) twentyFiveYearSavings.textContent = '$' + Math.round(cumSolar).toLocaleString();
    if (formulaKwh) formulaKwh.textContent = Math.round(monthlyKwh);
    if (formulaSun) formulaSun.textContent = sunHours.toFixed(1);
    if (formulaKw) formulaKw.textContent = kwNeeded.toFixed(2) + ' kW';

    if (badgeVerdict) {
      if (payback < 6) {
        badgeVerdict.textContent = "Fast Payback (< 6 Yrs)";
        badgeVerdict.className = "px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs whitespace-nowrap shrink-0";
      } else if (payback <= 8.5) {
        badgeVerdict.textContent = "Moderate (6 - 8.5 Yrs)";
        badgeVerdict.className = "px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-xs whitespace-nowrap shrink-0";
      } else {
        badgeVerdict.textContent = "Long Payback (> 8.5 Yrs)";
        badgeVerdict.className = "px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-xs whitespace-nowrap shrink-0";
      }
    }

    lastCalc = {
      kw: kwNeeded.toFixed(1),
      panels: panelCount,
      netCost: '$' + Math.round(netOutCost).toLocaleString(),
      itc: '$' + Math.round(itcAmount).toLocaleString(),
      payback: payback.toFixed(1),
      savings25: '$' + Math.round(cumSolar).toLocaleString()
    };
  }

  function bindSync(input, slider) {
    if (!input || !slider) return;
    slider.addEventListener('input', (e) => { input.value = e.target.value; calculate(); });
    input.addEventListener('input', (e) => { slider.value = e.target.value; calculate(); });
  }

  bindSync(billInput, billSlider);
  bindSync(rateInput, rateSlider);
  bindSync(sunInput, sunSlider);
  bindSync(costPerWattInput, costPerWattSlider);

  if (itcToggle) itcToggle.addEventListener('change', calculate);
  if (batteryToggle) batteryToggle.addEventListener('change', calculate);

  document.querySelectorAll('.btn-apply-size').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const billVal = e.currentTarget.getAttribute('data-size-bill');
      if (billVal && billInput && billSlider) {
        billInput.value = billVal;
        billSlider.value = billVal;
        calculate();
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Accordion FAQ toggle
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.currentTarget.closest('.faq-card');
      const body = parent.querySelector('.faq-body');
      const icon = e.currentTarget.querySelector('.faq-icon');
      if (body) {
        const isClosed = body.classList.contains('hidden');
        body.classList.toggle('hidden', !isClosed);
        if (icon) icon.textContent = isClosed ? '−' : '+';
      }
    });
  });

  // Copy Summary button
  const copyBtn = document.getElementById('copyEstimateBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = `SolarSavingsHQ Clean Energy Estimate Summary:
• Target Solar Array: ${lastCalc.kw} kW (~${lastCalc.panels} Monocrystalline Panels)
• Net Investment (after 30% Federal ITC): ${lastCalc.netCost}
• 30% Federal Tax Deduction (IRC § 25D): -${lastCalc.itc}
• Estimated Payback Horizon: ${lastCalc.payback} Years
• Projected 25-Year Cumulative Savings: ${lastCalc.savings25}
Calculate online at: https://www.solarsavingshq.com`;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 2500);
        }
      });
    });
  }

  calculate();
});

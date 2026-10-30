/* Standalone defaults for huashu-motion compositions embedded outside the studio. */
(() => {
  let declarations = [];
  try {
    declarations = JSON.parse(document.documentElement.getAttribute('data-composition-variables') || '[]');
  } catch (error) {
    console.error('Unable to read film variables:', error);
  }

  function variables() {
    const defaults = Object.fromEntries(declarations.map(variable => [variable.id, variable.default]));
    const engine = window.__omEngine;
    const overrides = engine?.variables?.() || window.__hyperframes?.getVariables?.() || {};
    const values = { ...defaults, ...overrides };
    for (const variable of declarations) {
      const value = values[variable.id];
      if (variable.type === 'number') {
        const number = Number(value);
        values[variable.id] = value !== '' && Number.isFinite(number) ? number : variable.default;
      } else if (variable.type === 'boolean' && typeof value === 'string') {
        values[variable.id] = value === 'true';
      }
    }
    return values;
  }

  // Preserve studio overrides while making the same source work on its own.
  window.OM ||= {};
  window.OM.vars = variables;
  function applyVariables() {
    const values = variables();
    for (const variable of declarations) {
      const value = values[variable.id];
      if (value == null || typeof value === 'object') continue;
      document.documentElement.style.setProperty('--' + variable.id, String(value));
    }
    for (const element of document.querySelectorAll('[data-var-text]')) {
      const value = values[element.dataset.varText];
      if (value != null) element.textContent = String(value);
    }
  }
  applyVariables();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyVariables, { once: true });
})();

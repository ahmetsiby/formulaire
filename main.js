const form = document.getElementById('estimationForm');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');

const noneCheckbox = document.getElementById('feature-none');
const featureCheckboxes = [...document.querySelectorAll('input[name="features"]')];

if (noneCheckbox) {
  noneCheckbox.addEventListener('change', () => {
    if (noneCheckbox.checked) {
      featureCheckboxes.forEach((checkbox) => {
        if (checkbox !== noneCheckbox) checkbox.checked = false;
      });
    }
  });

  featureCheckboxes.forEach((checkbox) => {
    if (checkbox !== noneCheckbox) {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          noneCheckbox.checked = false;
        }
      });
    }
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    fullName: formData.get('fullName')?.trim() || '',
    phone: formData.get('phone')?.trim() || '',
    email: formData.get('email')?.trim() || '',
    propertyAddress: formData.get('propertyAddress')?.trim() || '',
    propertyType: formData.get('propertyType') || '',
    surface: formData.get('surface')?.trim() || '',
    rooms: formData.get('rooms')?.trim() || '',
    propertyCondition: formData.get('propertyCondition') || '',
    features: formData.getAll('features'),
    projectType: formData.get('projectType') || '',
    saleDelay: formData.get('saleDelay') || '',
    message: formData.get('message')?.trim() || '',
    website: formData.get('website')?.trim() || '',
  };

  submitBtn.disabled = true;
  statusEl.textContent = 'Envoi en cours...';

  try {
    const response = await fetch('/.netlify/functions/estimation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erreur lors de l'envoi.");
    }

    statusEl.textContent =
      'Merci pour votre demande. Je reviens vers vous rapidement pour votre estimation personnalisée.';
    form.reset();
  } catch (error) {
    statusEl.textContent = error.message || 'Une erreur est survenue.';
    console.error(error);
  } finally {
    submitBtn.disabled = false;
  }
});
export default async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { message: 'Méthode non autorisée.' });
  }

  try {
    const body = await req.json();

    const {
      fullName = '',
      phone = '',
      email = '',
      propertyAddress = '',
      propertyType = '',
      surface = '',
      rooms = '',
      propertyCondition = '',
      features = [],
      projectType = '',
      saleDelay = '',
      message = '',
      website = '',
    } = body;

    if (website) {
      return jsonResponse(400, { message: 'Requête invalide.' });
    }

    if (!fullName.trim() || !phone.trim() || !email.trim() || !propertyAddress.trim() || !propertyType.trim()) {
      return jsonResponse(400, { message: 'Veuillez remplir les champs obligatoires.' });
    }

    if (!isValidEmail(email)) {
      return jsonResponse(400, { message: 'Adresse email invalide.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.ESTIMATION_TO_EMAIL;
    const fromEmail = process.env.ESTIMATION_FROM_EMAIL;

    if (!resendApiKey || !toEmail || !fromEmail) {
      return jsonResponse(500, { message: 'Configuration email incomplète.' });
    }

    const cleanFeatures = Array.isArray(features) ? features : [];
    const featuresText = cleanFeatures.length ? cleanFeatures.join(', ') : 'Aucune précision';

    const html = `
      <h2>Nouvelle demande d’estimation immobilière</h2>
      <p><strong>Nom / Prénom :</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Adresse du bien :</strong> ${escapeHtml(propertyAddress)}</p>
      <hr>
      <p><strong>Type de bien :</strong> ${escapeHtml(propertyType || 'Non précisé')}</p>
      <p><strong>Surface :</strong> ${escapeHtml(surface || 'Non précisée')} m²</p>
      <p><strong>Nombre de pièces :</strong> ${escapeHtml(rooms || 'Non précisé')}</p>
      <p><strong>État du bien :</strong> ${escapeHtml(propertyCondition || 'Non précisé')}</p>
      <p><strong>Particularités :</strong> ${escapeHtml(featuresText)}</p>
      <p><strong>Projet :</strong> ${escapeHtml(projectType || 'Non précisé')}</p>
      <p><strong>Délai de vente souhaité :</strong> ${escapeHtml(saleDelay || 'Non précisé')}</p>
      <hr>
      <p><strong>Message complémentaire :</strong></p>
      <p>${escapeHtml(message || 'Aucun message').replace(/\n/g, '<br>')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Nouvelle demande d’estimation - ${fullName}`,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Erreur Resend :', resendData);
      return jsonResponse(500, { message: "Impossible d'envoyer la demande." });
    }

    return jsonResponse(200, {
      message: 'Merci pour votre demande. Je reviens vers vous rapidement pour votre estimation personnalisée.',
    });
  } catch (error) {
    console.error('Erreur Function :', error);
    return jsonResponse(500, { message: 'Erreur serveur.' });
  }
};

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
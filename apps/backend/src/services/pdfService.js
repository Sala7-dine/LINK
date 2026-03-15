import puppeteer from 'puppeteer';

const generateCandidateProfile = async (user) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const skillBadges = (user.skills || []).map((s) => `<span class="badge">${s}</span>`).join('');
  const projects = (user.projects || [])
    .map(
      (p) => `<div class="project">
        <strong>${p.title}</strong>
        <p>${p.description || ''}</p>
        ${p.githubUrl ? `<a href="${p.githubUrl}">GitHub</a>` : ''}
      </div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
    h1 { color: ${user.school?.primaryColor || '#6C63FF'}; }
    .badge { background: ${user.school?.primaryColor || '#6C63FF'}22; color: ${user.school?.primaryColor || '#6C63FF'};
             padding: 4px 10px; border-radius: 20px; margin: 2px; display: inline-block; font-size: 12px; }
    .section { margin-bottom: 24px; }
    .project { border-left: 3px solid ${user.school?.primaryColor || '#6C63FF'}; padding-left: 12px; margin-bottom: 12px; }
    .school-logo { height: 40px; }
  </style>
</head>
<body>
  ${user.school?.logo ? `<img src="${user.school.logo}" class="school-logo" />` : ''}
  <h1>${user.name}</h1>
  <p>${user.email} ${user.githubUrl ? `| <a href="${user.githubUrl}">GitHub</a>` : ''}</p>
  ${user.bio ? `<div class="section"><p>${user.bio}</p></div>` : ''}
  <div class="section"><h2>Compétences</h2>${skillBadges}</div>
  ${user.projects?.length ? `<div class="section"><h2>Projets</h2>${projects}</div>` : ''}
  <div class="section"><p>Promotion: ${user.promotion || '-'} | ${user.school?.name || ''}</p></div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
};

export { generateCandidateProfile };

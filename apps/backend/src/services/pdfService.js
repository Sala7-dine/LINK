import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const generateCandidateProfile = async (user, experiences = []) => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  });
  const page = await browser.newPage();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Présent';
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  const getBadges = (arr) => (arr || []).map(item => `<span class="badge">${item}</span>`).join('');

  let avatarDataUri = '';
  if (user.avatar) {
    try {
      // user.avatar is generally "/uploads/xyz.jpg"
      // process.cwd() is "/app" in backend docker container
      const filePath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).slice(1).toLowerCase();
        const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
        const base64Str = fs.readFileSync(filePath, { encoding: 'base64' });
        avatarDataUri = `data:image/${mime};base64,${base64Str}`;
      } else {
        console.warn('Avatar file not found at:', filePath);
      }
    } catch (err) {
      console.error('Failed to load avatar for PDF:', err);
    }
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --text-main: #111827;
      --text-muted: #4b5563;
      --bg-light: #f9fafb;
      --border: #e5e7eb;
      --black: #000000;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Inter', sans-serif; 
      color: var(--text-main); 
      background: white;
      font-size: 11px;
      line-height: 1.5;
    }
    .resume-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
    }
    /* Left Column */
    .col-left {
      width: 32%;
      background-color: var(--bg-light);
      padding: 40px 30px;
      border-right: 1px solid var(--border);
    }
    .profile-img-container {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px auto;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: bold;
      color: var(--black);
    }
    .profile-img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .contact-item {
      margin-bottom: 8px;
    }
    .contact-item strong {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 2px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--black);
      padding-bottom: 4px;
      margin: 24px 0 12px 0;
      color: var(--black);
    }
    .badge-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .badge {
      background: white;
      border: 1px solid var(--black);
      color: var(--black);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }
    .list-item {
      margin-bottom: 4px;
    }

    /* Right Column */
    .col-right {
      width: 68%;
      padding: 40px 40px;
    }
    .header-name {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      color: var(--black);
      margin-bottom: 4px;
    }
    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .bio {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 24px;
      text-align: justify;
    }
    
    .timeline-item {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .timeline-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--black);
    }
    .timeline-date {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .timeline-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .timeline-desc {
      color: var(--text-muted);
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    
    <!-- LEFT COLUMN -->
    <div class="col-left">
      <div class="profile-img-container">
        ${avatarDataUri ? `<img src="${avatarDataUri}" onerror="this.style.display='none'"/>` : (user.name ? user.name.charAt(0).toUpperCase() : '')}
      </div>

      <div class="section-title" style="margin-top: 0;">Contact</div>
      ${user.email ? `<div class="contact-item"><strong>Email</strong>${user.email}</div>` : ''}
      ${user.phone ? `<div class="contact-item"><strong>Téléphone</strong>${user.phone}</div>` : ''}
      ${user.address ? `<div class="contact-item"><strong>Adresse</strong>${user.address}</div>` : ''}
      ${user.linkedinUrl ? `<div class="contact-item"><strong>LinkedIn</strong>${user.linkedinUrl.replace(/^https?:\/\//, '')}</div>` : ''}
      ${user.githubUrl ? `<div class="contact-item"><strong>GitHub</strong>${user.githubUrl.replace(/^https?:\/\//, '')}</div>` : ''}
      ${user.portfolio ? `<div class="contact-item"><strong>Portfolio</strong>${user.portfolio.replace(/^https?:\/\//, '')}</div>` : ''}

      ${(user.frontendSkills?.length || user.backendSkills?.length || user.toolSkills?.length || user.skills?.length) ? `
      <div class="section-title">Compétences Techniques</div>
      ` : ''}
      
      ${user.frontendSkills?.length ? `
      <div class="contact-item"><strong>Front-end</strong>
        <div class="badge-container">${getBadges(user.frontendSkills)}</div>
      </div>` : ''}
      
      ${user.backendSkills?.length ? `
      <div class="contact-item"><strong>Back-end</strong>
        <div class="badge-container">${getBadges(user.backendSkills)}</div>
      </div>` : ''}

      ${user.toolSkills?.length ? `
      <div class="contact-item"><strong>Outils & Base de données</strong>
        <div class="badge-container">${getBadges(user.toolSkills)}</div>
      </div>` : ''}
      
      ${/* Fallback to generic skills if specific ones aren't populated */ ''}
      ${user.skills?.length && !user.frontendSkills?.length && !user.backendSkills?.length ? `
      <div class="contact-item"><strong>Général</strong>
        <div class="badge-container">${getBadges(user.skills)}</div>
      </div>` : ''}

      ${user.softSkills?.length ? `
      <div class="section-title">Savoir-être</div>
      <div class="badge-container">${getBadges(user.softSkills)}</div>
      ` : ''}

      ${user.languages?.length ? `
      <div class="section-title">Langues</div>
      ${user.languages.map(l => `<div class="list-item">• ${l}</div>`).join('')}
      ` : ''}

      ${user.hobbies?.length ? `
      <div class="section-title">Centres d'intérêt</div>
      ${user.hobbies.map(h => `<div class="list-item">• ${h}</div>`).join('')}
      ` : ''}
    </div>

    <!-- RIGHT COLUMN -->
    <div class="col-right">
      <h1 class="header-name">${user.name}</h1>
      <div class="header-title">${user.promotion ? `Étudiant en ${user.promotion}` : 'Développeur / Étudiant'}</div>
      
      ${user.bio ? `<div class="bio">${user.bio}</div>` : ''}

      ${experiences.length > 0 ? `
      <div class="section-title">Expériences Professionnelles</div>
      ${experiences.map(exp => `
        <div class="timeline-item">
          <div class="timeline-header">
            <div class="timeline-title">${exp.companyName}</div>
            <div class="timeline-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</div>
          </div>
          <div class="timeline-subtitle">${exp.experienceType === 'first_year_internship' ? 'Stage 1ère année' : exp.experienceType === 'second_year_internship' ? 'Stage 2ème année' : exp.experienceType} ${exp.location ? `| ${exp.location}` : ''}</div>
          <div class="timeline-desc">${exp.description || ''}</div>
          ${exp.technologies?.length ? `<div class="badge-container" style="margin-top: 6px;">${getBadges(exp.technologies)}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}

      ${user.educations && user.educations.length > 0 ? `
      <div class="section-title">Formation</div>
      ${user.educations.map(edu => `
        <div class="timeline-item">
          <div class="timeline-header">
            <div class="timeline-title">${edu.degree}</div>
            <div class="timeline-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
          </div>
          <div class="timeline-subtitle">${edu.school}</div>
          ${edu.description ? `<div class="timeline-desc">${edu.description}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}

      ${user.projects && user.projects.length > 0 ? `
      <div class="section-title">Projets Personnels</div>
      ${user.projects.map(proj => `
        <div class="timeline-item">
          <div class="timeline-header">
            <div class="timeline-title">${proj.title}</div>
            ${proj.githubUrl ? `<div class="timeline-date"><a href="${proj.githubUrl}" style="color:var(--text-main); text-decoration:none;">GitHub</a></div>` : ''}
          </div>
          <div class="timeline-desc">${proj.description || ''}</div>
          ${proj.technologies?.length ? `<div class="badge-container" style="margin-top: 6px;">${getBadges(proj.technologies)}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}

    </div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ 
    format: 'A4', 
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await browser.close();
  return pdfBuffer;
};

export { generateCandidateProfile };

import { useRef, useState } from 'react'
import { Check, ChevronDown, FileText, FileUp, LoaderCircle, Printer, ShieldCheck, Sparkles } from 'lucide-react'
import './ResumeStudio.css'

const storageKey = 'job-atlas-resume-draft'
const countries = ['United Kingdom', 'Ireland', 'Netherlands', 'Germany', 'France', 'Spain', 'Italy', 'Denmark', 'Norway', 'Finland', 'Belgium', 'Austria', 'Switzerland', 'Poland', 'Australia', 'New Zealand', 'Singapore', 'Japan']

const markets = [
  { countries: ['United Kingdom', 'Ireland'], title: 'UK / Ireland CV', length: 'Usually 1-2 pages', photo: 'Photo: omit', note: 'Lead with measurable outcomes, a concise profile, and a clear employment history. Include work authorization only when relevant to the role.' },
  { countries: ['Netherlands', 'Germany', 'France', 'Spain', 'Italy', 'Denmark', 'Norway', 'Finland', 'Belgium', 'Austria', 'Switzerland', 'Poland'], title: 'European CV', length: '1-2 pages', photo: 'Photo: follow local guidance', note: 'Keep the layout simple and chronological. Surface language proficiency, location, and relevant work authorization; avoid personal details that are not requested.' },
  { countries: ['Australia', 'New Zealand'], title: 'Australia / New Zealand resume', length: 'Usually 2-3 pages', photo: 'Photo: omit', note: 'Prioritize role-specific achievements, local spelling, and practical work-rights or relocation details. Use clear section headings and reverse chronology.' },
  { countries: ['Singapore'], title: 'Singapore resume', length: 'Usually 1-2 pages', photo: 'Photo: omit unless requested', note: 'Use concise achievement statements and make location, language skills, and relevant work-pass status easy to find.' },
  { countries: ['Japan'], title: 'Japan career resume', length: 'Pair with local forms when requested', photo: 'Photo: local rirekisho may request one', note: 'For many Japanese employers, an English resume may be paired with a rirekisho and a detailed shokumu-keirekisho. Confirm language and format expectations in the listing.' },
]

const stopWords = new Set(['about', 'after', 'also', 'and', 'are', 'based', 'been', 'being', 'behind', 'build', 'company', 'for', 'from', 'global', 'have', 'help', 'into', 'join', 'looking', 'must', 'our', 'over', 'role', 'support', 'team', 'that', 'the', 'their', 'this', 'those', 'through', 'with', 'will', 'work', 'you', 'your', 'years'])

const emptyResume = {
  country: 'United Kingdom',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  targetRole: '',
  summary: '',
  experience: '',
  skills: '',
  education: '',
  jobDescription: '',
}

function loadDraft(targetJob, initialTargetRole) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return {
      ...emptyResume,
      ...saved,
      targetRole: targetJob?.title || saved.targetRole || initialTargetRole || '',
      jobDescription: targetJob?.description || saved.jobDescription || '',
    }
  } catch {
    return { ...emptyResume, targetRole: targetJob?.title || initialTargetRole || '', jobDescription: targetJob?.description || '' }
  }
}

async function readResumeFile(file) {
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a resume smaller than 12 MB.')
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') {
    const pdfjs = await import('pdfjs-dist')
    const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    const pages = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => ('str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : '')).join(''))
    }
    return pages.join('\n')
  }
  if (extension === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser.js')
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return result.value
  }
  if (extension === 'txt') return file.text()
  throw new Error('Use a searchable PDF, DOCX, or TXT resume.')
}

function parseResumeDetails(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || ''
  const phonePattern = /\+?\d[\d\s().-]{7,}\d/
  const phone = lines.slice(0, 12).map((line) => line.match(phonePattern)?.[0]).find(Boolean) || ''
  const name = lines.slice(0, 10).find((line) => line.length <= 55 && !/@/.test(line) && !phonePattern.test(line) && !/linkedin|https?:\/\/|curriculum vitae|^resume$|^cv$/i.test(line)) || ''
  const sectionPatterns = [
    ['summary', /^(?:professional\s+)?(?:summary|profile|objective|about\s+me)\b\s*:?[\s]*(.*)$/i],
    ['experience', /^(?:professional\s+)?(?:experience|employment\s+history|work\s+history|career\s+history)\b\s*:?[\s]*(.*)$/i],
    ['skills', /^(?:technical\s+|core\s+)?(?:skills|competencies|expertise)\b\s*:?[\s]*(.*)$/i],
    ['education', /^(?:education|academic\s+background|qualifications)\b\s*:?[\s]*(.*)$/i],
  ]
  const sections = { summary: [], experience: [], skills: [], education: [] }
  let activeSection = ''
  for (const line of lines) {
    const heading = sectionPatterns.map(([section, pattern]) => ({ section, match: line.match(pattern) })).find((item) => item.match)
    if (heading) {
      activeSection = heading.section
      if (heading.match[1]) sections[activeSection].push(heading.match[1])
      continue
    }
    if (activeSection && !line.includes(email) && !phonePattern.test(line)) sections[activeSection].push(line)
  }
  const summary = sections.summary.join('\n') || lines.slice(Math.max(1, lines.indexOf(name) + 1), 8).filter((line) => line !== email && !phonePattern.test(line)).join(' ')
  return {
    fullName: name,
    email,
    phone,
    summary,
    experience: sections.experience.join('\n'),
    skills: sections.skills.join(', '),
    education: sections.education.join('\n'),
  }
}

function getAtsEstimate(resume) {
  const resumeText = [resume.fullName, resume.email, resume.phone, resume.location, resume.targetRole, resume.summary, resume.experience, resume.skills, resume.education].join(' ').toLowerCase()
  const keywords = [...new Set((resume.jobDescription.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []).filter((word) => !stopWords.has(word)))].slice(0, 16)
  const matchedKeywords = keywords.filter((keyword) => resumeText.includes(keyword))
  const keywordCoverage = keywords.length ? matchedKeywords.length / keywords.length : 0
  const checks = [
    { label: 'Name and valid email', weight: 15, complete: Boolean(resume.fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email.trim())) },
    { label: 'Location included', weight: 5, complete: Boolean(resume.location.trim()) },
    { label: 'Target role named', weight: 10, complete: Boolean(resume.targetRole.trim()) },
    { label: 'Professional summary', weight: 10, complete: Boolean(resume.summary.trim()) },
    { label: 'Relevant experience', weight: 15, complete: Boolean(resume.experience.trim()) },
    { label: 'Skills section', weight: 10, complete: Boolean(resume.skills.trim()) },
    { label: 'Education section', weight: 10, complete: Boolean(resume.education.trim()) },
  ]
  const structureScore = checks.reduce((total, check) => total + (check.complete ? check.weight : 0), 0)
  const score = structureScore + Math.round(keywordCoverage * 25)
  return { score, checks, keywords, matchedKeywords, keywordCoverage }
}

function Field({ label, value, onChange, placeholder, multiline = false, rows = 4, type = 'text' }) {
  const Component = multiline ? 'textarea' : 'input'
  return (
    <label className="resume-field">
      <span>{label}</span>
      <Component type={multiline ? undefined : type} rows={multiline ? rows : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function ResumeStudio({ initialTargetRole, targetJob }) {
  const [resume, setResume] = useState(() => loadDraft(targetJob, initialTargetRole))
  const [saved, setSaved] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)
  const market = markets.find((item) => item.countries.includes(resume.country)) || markets[0]
  const estimate = getAtsEstimate(resume)
  const readiness = estimate.score >= 80 ? 'Strong match' : estimate.score >= 55 ? 'Getting there' : 'Needs detail'
  const keywordsText = resume.skills.split(/[\n,;]+/).map((skill) => skill.trim()).filter(Boolean)

  function updateField(field, value) {
    const next = { ...resume, [field]: value }
    setResume(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  function printResume() {
    window.print()
  }

  async function importResume(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImporting(true)
    setImportMessage('')
    setImportError('')
    try {
      const text = await readResumeFile(file)
      if (text.trim().length < 40) throw new Error('No selectable text found. Scanned image-only PDFs need OCR before import.')
      const extracted = parseResumeDetails(text)
      const importedFields = Object.fromEntries(Object.entries(extracted).filter(([, value]) => value.trim()))
      const next = { ...resume, ...importedFields }
      setResume(next)
      localStorage.setItem(storageKey, JSON.stringify(next))
      setSaved(true)
      setImportMessage(`Imported text from ${file.name}. Review the fields and ATS match.`)
    } catch (error) {
      setImportError(error.message || 'This resume could not be read.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="resume-studio">
      <header className="resume-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> RESUME WORKSPACE</div>
          <h1>Make your experience <em>travel.</em></h1>
          <p className="welcome-copy">A clean, editable resume shaped for your next market.</p>
        </div>
        <div className="resume-heading-actions">
          <span className="resume-saved-state"><ShieldCheck size={15} /> {saved ? 'Draft saved on this device' : 'Private local draft'}</span>
          <button className="resume-import-button" onClick={() => fileInputRef.current?.click()} disabled={importing}>{importing ? <LoaderCircle className="import-spinner" size={16} /> : <FileUp size={16} />}{importing ? 'Reading resume' : 'Import existing resume'}</button>
          <button className="resume-print-button" onClick={printResume}><Printer size={16} /> Print / Save PDF</button>
          <input ref={fileInputRef} className="resume-file-input" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={importResume} />
        </div>
      </header>

      {(importMessage || importError) && <div className={importError ? 'resume-import-feedback error' : 'resume-import-feedback'} role="status">{importError || importMessage}</div>}

      <div className="resume-market-bar">
        <label className="resume-country-field"><span>Target market</span><span className="resume-select-wrap"><select value={resume.country} onChange={(event) => updateField('country', event.target.value)}>{countries.map((country) => <option key={country}>{country}</option>)}</select><ChevronDown size={15} /></span></label>
        <div className="market-guidance"><span className="market-kicker">{market.title}</span><span>{market.note}</span></div>
        <div className="market-meta"><span>{market.length}</span><span>{market.photo}</span></div>
      </div>

      <div className="resume-workspace">
        <section className="resume-editor" aria-label="Resume details">
          <div className="resume-section-heading"><div><span className="resume-step">01</span><h2>Build your profile</h2></div><span className="resume-private-label"><ShieldCheck size={13} /> Stored in this browser</span></div>
          <div className="resume-form-grid">
            <Field label="Full name" value={resume.fullName} onChange={(value) => updateField('fullName', value)} placeholder="e.g. Alex Morgan" />
            <Field label="Target role" value={resume.targetRole} onChange={(value) => updateField('targetRole', value)} placeholder="e.g. Product Designer" />
            <Field label="Email" type="email" value={resume.email} onChange={(value) => updateField('email', value)} placeholder="alex@email.com" />
            <Field label="Phone" value={resume.phone} onChange={(value) => updateField('phone', value)} placeholder="+44 7000 000000" />
            <Field label="Current location" value={resume.location} onChange={(value) => updateField('location', value)} placeholder="City, country" />
            <Field label="Education" value={resume.education} onChange={(value) => updateField('education', value)} placeholder="Degree, institution, year" />
            <div className="resume-field full-width"><Field label="Professional summary" multiline rows={4} value={resume.summary} onChange={(value) => updateField('summary', value)} placeholder="Summarize your experience, strengths, and the impact you bring." /></div>
            <div className="resume-field full-width"><Field label="Experience" multiline rows={7} value={resume.experience} onChange={(value) => updateField('experience', value)} placeholder={'Senior Product Designer | Acme, 2022-2025\nImproved onboarding completion by 24% through research-led redesign.\nLed a team of 4 across product and engineering.'} /></div>
            <div className="resume-field full-width"><Field label="Skills" multiline rows={3} value={resume.skills} onChange={(value) => updateField('skills', value)} placeholder="Figma, user research, prototyping, accessibility" /></div>
            <div className="resume-field full-width job-description-field"><Field label="Job description for ATS comparison" multiline rows={5} value={resume.jobDescription} onChange={(value) => updateField('jobDescription', value)} placeholder="Paste the target job description to compare its keywords with your resume." /></div>
          </div>
        </section>

        <aside className="resume-side-column">
          <section className="ats-panel" aria-label="ATS score estimate">
            <div className="resume-section-heading ats-heading"><div><span className="resume-step">02</span><h2>ATS readiness</h2></div><Sparkles size={17} /></div>
            <div className="ats-score-row"><div className="ats-score-ring" style={{ '--score-angle': `${estimate.score * 3.6}deg` }}><div><strong>{estimate.score}</strong><span>/ 100</span></div></div><div className="ats-score-copy"><span>{readiness}</span><p>Heuristic estimate from resume sections and matching terms. Not an employer ATS result.</p></div></div>
            <div className="ats-checks">{estimate.checks.map((check) => <div className="ats-check-row" key={check.label}><span className={check.complete ? 'ats-check-icon complete' : 'ats-check-icon'}>{check.complete && <Check size={12} />}</span><span>{check.label}</span><span className={check.complete ? 'check-points complete' : 'check-points'}>{check.complete ? `+${check.weight}` : `${check.weight} pts`}</span></div>)}<div className="ats-keyword-row"><span className="keyword-title">Job keywords</span><span>{estimate.matchedKeywords.length} / {estimate.keywords.length || '—'} matched</span></div>
              {estimate.keywords.length > 0 && <div className="keyword-list">{estimate.keywords.slice(0, 8).map((keyword) => <span className={estimate.matchedKeywords.includes(keyword) ? 'keyword-chip matched' : 'keyword-chip'} key={keyword}>{keyword}</span>)}</div>}
            </div>
          </section>

          <section className="resume-preview-panel" aria-label="Resume preview">
            <div className="resume-section-heading preview-heading"><div><span className="resume-step">03</span><h2>Resume preview</h2></div><FileText size={17} /></div>
            <article className="resume-sheet">
              <div className="sheet-topline"><span>{market.title}</span><span>{resume.country}</span></div>
              <header className="sheet-identity"><h2>{resume.fullName || 'Your name'}</h2><strong>{resume.targetRole || 'Target role'}</strong><p>{[resume.email, resume.phone, resume.location].filter(Boolean).join('  ·  ') || 'Email  ·  Phone  ·  Location'}</p></header>
              <section className="sheet-section"><h3>Professional summary</h3><p>{resume.summary || 'Add a concise profile tailored to the role and destination market.'}</p></section>
              <section className="sheet-section"><h3>Experience</h3><p className="sheet-preserved-text">{resume.experience || 'Add recent roles and achievement-focused bullet points.'}</p></section>
              <section className="sheet-section"><h3>Skills</h3><p>{keywordsText.length ? keywordsText.join('  ·  ') : 'Add role-relevant skills and tools.'}</p></section>
              <section className="sheet-section"><h3>Education</h3><p>{resume.education || 'Add degree, institution, and graduation year.'}</p></section>
            </article>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default ResumeStudio
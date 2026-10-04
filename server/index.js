import 'dotenv/config'
import express from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()

const port = process.env.PORT || process.env.API_PORT || 3001
const dataDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const applicationsFile = path.join(dataDirectory, 'applications.json')

app.use(express.json({ limit: '1mb' }))

const sampleJobs = [
  { id: 'sample-platform-architect', company: 'Miro', title: 'Senior Software Engineer, Platform', location: 'Amsterdam, Netherlands', country: 'Netherlands', salary: '€85k–€110k', posted: '2 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Help build the platform foundations behind a global collaboration product. Work with a distributed team on reliable services, developer tooling, and systems that support millions of users. The listing notes visa sponsorship; confirm eligibility with the hiring team.', tags: ['Backend systems', 'Relocation support', 'International team'], accent: 'yellow', via: 'Miro Careers' },
  { id: 'sample-personio-engineer', company: 'Personio', title: 'Senior Software Engineer, Integrations', location: 'Berlin, Germany', country: 'Germany', salary: '€78k–€105k', posted: '3 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Join a growing HR technology company building integrations for customers across Europe. The sample listing indicates visa support; confirm role eligibility and sponsorship details with the employer.', tags: ['SaaS', 'Integrations', 'Visa support'], accent: 'orange', via: 'Personio Careers' },
  { id: 'sample-airwallex-engineer', company: 'Airwallex', title: 'Software Engineer, Payments', location: 'Melbourne, Australia', country: 'Australia', salary: 'A$140k–A$180k', posted: '4 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Build payment infrastructure for an international financial technology company. The sample listing notes sponsorship for eligible candidates; confirm the current visa pathway with the hiring team.', tags: ['Fintech', 'Payments', 'Relocation support'], accent: 'blue', via: 'Airwallex Careers' },
  { id: 'sample-product-engineer', company: 'Canva', title: 'Product Engineer, Growth', location: 'Sydney, Australia', country: 'Australia', salary: 'A$145k–A$185k', posted: '1 day ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Join a cross-functional product team building delightful experiences for a global audience. This opportunity mentions employer-sponsored work visas for eligible candidates. Confirm role-specific requirements before applying.', tags: ['React', 'Product engineering', 'Work visa support'], accent: 'blue', via: 'Canva Careers' },
  { id: 'sample-cloud-engineer', company: 'Atlassian', title: 'Cloud Infrastructure Engineer', location: 'Singapore', country: 'Singapore', salary: 'S$115k–S$155k', posted: '3 days ago', workType: 'Full-time', sponsorshipEvidence: 'Work pass support noted', description: 'Build resilient cloud infrastructure with an internationally distributed engineering organization. The employer notes work pass support for successful candidates; verify the applicable pass and eligibility directly.', tags: ['Cloud infrastructure', 'Work pass support', 'Distributed systems'], accent: 'orange', via: 'Atlassian Careers' },
  { id: 'sample-data-scientist', company: 'Wise', title: 'Data Scientist, Customer', location: 'London, United Kingdom', country: 'United Kingdom', salary: '£78k–£105k', posted: '4 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Skilled Worker sponsorship', description: 'Use experimentation and customer data to improve an international payments product. The listing references Skilled Worker visa sponsorship for eligible applicants. Check the role page for current requirements.', tags: ['Experimentation', 'Skilled Worker visa', 'Analytics'], accent: 'green', via: 'Wise Careers' },
  { id: 'sample-ml-engineer', company: 'Rakuten', title: 'Machine Learning Engineer', location: 'Tokyo, Japan', country: 'Japan', salary: '¥8M–¥12M', posted: '5 days ago', workType: 'On-site', sponsorshipEvidence: 'Relocation and visa support', description: 'Develop and deploy machine-learning systems for products serving customers across Japan and the wider region. The employer indicates relocation and visa support; confirm Japanese language expectations with the team.', tags: ['Machine learning', 'Relocation support', 'Python'], accent: 'pink', via: 'Rakuten Careers' },
  { id: 'sample-security-engineer', company: 'GitLab', title: 'Security Engineer, Application Security', location: 'Dublin, Ireland', country: 'Ireland', salary: '€92k–€130k', posted: '1 week ago', workType: 'Remote', sponsorshipEvidence: 'Visa sponsorship available', description: 'Partner with engineering teams to strengthen application security at a remote-first company. Sponsorship options vary by hiring location; discuss local authorization requirements during the process.', tags: ['Application security', 'Remote-first', 'Visa sponsorship'], accent: 'orange', via: 'GitLab Careers' },
  { id: 'sample-devops-engineer', company: 'Xero', title: 'Senior DevOps Engineer', location: 'Auckland, New Zealand', country: 'New Zealand', salary: 'NZ$135k–NZ$170k', posted: '6 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Accredited-employer support', description: 'Improve delivery systems and production reliability for a cloud accounting platform. The role notes support for eligible international applicants through New Zealand work visa pathways; confirm details with the recruiter.', tags: ['Platform engineering', 'Visa pathway support', 'Cloud'], accent: 'blue', via: 'Xero Careers' },
  { id: 'sample-backend-engineer', company: 'Spotify', title: 'Backend Engineer, Personalization', location: 'Stockholm, Sweden', country: 'Sweden', salary: 'SEK 650k–850k', posted: '2 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Relocation support noted', description: 'Build backend services that help listeners discover their next favorite track. The listing indicates relocation support for international hires; ask the recruiter about work permit sponsorship and timing.', tags: ['Backend', 'Relocation support', 'Kotlin'], accent: 'green', via: 'Spotify Careers' },
  { id: 'sample-france-engineer', company: 'Doctolib', title: 'Senior Software Engineer', location: 'Paris, France', country: 'France', salary: '€70k–€95k', posted: '3 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Join the leading healthcare platform in Europe. Doctolib offers visa sponsorship for international talent. Help build products that improve access to healthcare across France and Germany.', tags: ['Healthcare', 'React', 'Visa support'], accent: 'blue', via: 'Doctolib Careers' },
  { id: 'sample-spain-engineer', company: 'Cabify', title: 'Backend Engineer', location: 'Madrid, Spain', country: 'Spain', salary: '€55k–€75k', posted: '4 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Build scalable mobility solutions for millions of users. Cabify offers relocation support and visa sponsorship for international engineers. Work on high-scale systems in a fast-growing market.', tags: ['Mobility', 'Microservices', 'Relocation support'], accent: 'orange', via: 'Cabify Careers' },
  { id: 'sample-italy-engineer', company: 'Satispay', title: 'Full Stack Engineer', location: 'Milan, Italy', country: 'Italy', salary: '€50k–€70k', posted: '5 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Build the future of digital payments in Italy and Europe. Satispay supports international hires with visa sponsorship and relocation assistance. Join a mission-driven fintech company.', tags: ['Fintech', 'Full stack', 'Visa support'], accent: 'green', via: 'Satispay Careers' },
  { id: 'sample-denmark-engineer', company: 'Trustpilot', title: 'Software Engineer', location: 'Copenhagen, Denmark', country: 'Denmark', salary: 'DKK 550k–750k', posted: '3 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Help millions of consumers share reviews and businesses improve their online reputation. Trustpilot offers visa sponsorship for international candidates. Work with modern tech stack in Copenhagen.', tags: ['Consumer tech', 'TypeScript', 'Visa support'], accent: 'blue', via: 'Trustpilot Careers' },
  { id: 'sample-norway-engineer', company: 'Kahoot!', title: 'Senior Backend Engineer', location: 'Oslo, Norway', country: 'Norway', salary: 'NOK 800k–1.1M', posted: '4 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Make learning awesome for millions of users worldwide. Kahoot! provides relocation support and visa sponsorship for international engineers. Build engaging educational technology.', tags: ['EdTech', 'Kotlin', 'Relocation support'], accent: 'purple', via: 'Kahoot! Careers' },
  { id: 'sample-finland-engineer', company: 'Supercell', title: 'Game Server Engineer', location: 'Helsinki, Finland', country: 'Finland', salary: '€70k–€95k', posted: '2 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Create games played by millions every day. Supercell offers visa sponsorship and relocation support for game developers. Work on high-scale game backend systems.', tags: ['Gaming', 'C++', 'Visa support'], accent: 'red', via: 'Supercell Careers' },
  { id: 'sample-belgium-engineer', company: 'Collibra', title: 'Data Engineer', location: 'Brussels, Belgium', country: 'Belgium', salary: '€65k–€90k', posted: '5 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Help organizations unlock the value of their data. Collibra provides visa sponsorship for international data talent. Build data intelligence platforms for global enterprises.', tags: ['Data engineering', 'Cloud', 'Visa support'], accent: 'orange', via: 'Collibra Careers' },
  { id: 'sample-austria-engineer', company: 'Bitpanda', title: 'Backend Engineer', location: 'Vienna, Austria', country: 'Austria', salary: '€60k–€85k', posted: '3 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Democratize investing for everyone. Bitpanda offers visa sponsorship for international engineers. Build crypto and digital asset trading infrastructure.', tags: ['Fintech', 'Crypto', 'Visa support'], accent: 'orange', via: 'Bitpanda Careers' },
  { id: 'sample-switzerland-engineer', company: 'SonarSource', title: 'Software Engineer', location: 'Zurich, Switzerland', country: 'Switzerland', salary: 'CHF 110k–150k', posted: '4 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Work permit support noted', description: 'Help developers write clean, secure code. SonarSource provides work permit support for international candidates. Work on static analysis tools used by millions.', tags: ['Developer tools', 'Java', 'Work permit support'], accent: 'blue', via: 'SonarSource Careers' },
  { id: 'sample-poland-engineer', company: 'CD PROJEKT RED', title: 'Engine Programmer', location: 'Warsaw, Poland', country: 'Poland', salary: 'PLN 180k–250k', posted: '5 days ago', workType: 'Hybrid', sponsorshipEvidence: 'Visa sponsorship available', description: 'Create world-class RPGs like Cyberpunk 2077 and The Witcher. CD PROJEKT RED offers visa sponsorship for game developers. Work on cutting-edge game technology.', tags: ['Gaming', 'C++', 'Visa support'], accent: 'red', via: 'CD PROJEKT RED Careers' },
]

const countryLocations = {
  Netherlands: 'Amsterdam, Netherlands', Germany: 'Berlin, Germany', Ireland: 'Dublin, Ireland', Sweden: 'Stockholm, Sweden',
  France: 'Paris, France', Spain: 'Madrid, Spain', Italy: 'Milan, Italy', Denmark: 'Copenhagen, Denmark', Norway: 'Oslo, Norway',
  Finland: 'Helsinki, Finland', Belgium: 'Brussels, Belgium', Austria: 'Vienna, Austria', Switzerland: 'Zurich, Switzerland', Poland: 'Warsaw, Poland',
  'United Kingdom': 'London, United Kingdom', Australia: 'Sydney, Australia', 'New Zealand': 'Auckland, New Zealand',
  Singapore: 'Singapore', Japan: 'Tokyo, Japan',
}

const startupCompanies = new Set(['airwallex', 'miro', 'personio', 'pleo', 'rippling', 'vercel', 'deel', 'oyster', 'notion', 'openai'])
const multinationalCompanies = new Set(['adobe', 'amazon', 'apple', 'atlassian', 'canva', 'google', 'gitlab', 'ibm', 'meta', 'microsoft', 'nvidia', 'oracle', 'rakuten', 'salesforce', 'sap', 'shopify', 'spotify', 'uber', 'wise', 'xero'])

function classifyCompany(company) {
  const name = company.trim().toLowerCase()
  if (startupCompanies.has(name)) return 'startup'
  if (multinationalCompanies.has(name)) return 'top-mnc'
  return 'other'
}

async function readApplications() {
  try {
    const items = JSON.parse(await readFile(applicationsFile, 'utf8'))
    return items.filter((item) => item && item.id && item.job && item.jobId)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

function sponsorshipEvidence(text) {
  return /visa sponsorship (?:is )?(?:available|provided|offered|considered)|sponsor(?:ship|ed|ing)? (?:a )?(?:work|employment|visa)|work pass support|work permit support|skilled worker visa|relocation (?:and )?visa support|visa and relocation support|immigration support|accredited employer/i.test(text)
}

function mapGoogleJob(job, index, query) {
  const description = job.description || ''
  const extensions = job.extensions || []
  const evidence = [...extensions, description].join(' ')
  const applyUrl = job.apply_options?.[0]?.link || job.related_links?.[0]?.link
  return {
    id: `google-${Buffer.from(`${job.company_name}-${job.title}-${job.location}-${index}`).toString('base64url')}`,
    company: job.company_name || 'Company not listed',
    title: job.title || query,
    location: job.location || 'Location not listed',
    salary: job.detected_extensions?.salary || '',
    posted: job.detected_extensions?.posted_at || 'Date not listed',
    workType: job.detected_extensions?.schedule_type || 'Full-time',
    companyType: classifyCompany(job.company_name || ''),
    sponsorshipEvidence: sponsorshipEvidence(evidence) ? 'Sponsorship mentioned' : 'Confirm with employer',
    description,
    tags: extensions.slice(0, 4),
    via: job.via || 'Google Jobs',
    url: applyUrl || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title}`)}`,
    applyUrl: applyUrl || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title} careers`)}`,
  }
}

function mapJSearchJob(job, index, query) {
  const evidence = `${job.job_description || ''} ${job.job_highlights?.Qualifications || ''} ${job.job_highlights?.Responsibilities || ''} ${job.job_highlights?.Benefits || ''}`
  return {
    id: `jsearch-${Buffer.from(`${job.employer_name}-${job.job_title}-${job.job_location}-${index}`).toString('base64url')}`,
    company: job.employer_name || 'Company not listed',
    title: job.job_title || query,
    location: job.job_location || 'Location not listed',
    salary: job.job_salary || '',
    posted: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : 'Recently posted',
    workType: job.job_employment_type || 'Full-time',
    companyType: classifyCompany(job.employer_name || ''),
    sponsorshipEvidence: sponsorshipEvidence(evidence) ? 'Sponsorship mentioned' : 'Confirm with employer',
    description: job.job_description || '',
    tags: (job.job_highlights?.Qualifications || []).slice(0, 4),
    via: 'JSearch',
    url: job.job_apply_link || `https://www.google.com/search?q=${encodeURIComponent(`${job.employer_name} ${job.job_title}`)}`,
    applyUrl: job.job_apply_link || `https://www.google.com/search?q=${encodeURIComponent(`${job.employer_name} ${job.job_title} careers`)}`,
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', searchConfigured: Boolean(process.env.SERPAPI_KEY) })
})

app.get('/api/jobs', async (request, response) => {
  const query = String(request.query.query || 'software engineer').slice(0, 120)
  const country = String(request.query.country || 'All destinations')
  const companyType = ['startup', 'top-mnc'].includes(request.query.companyType) ? request.query.companyType : 'all'
  if (!process.env.SERPAPI_KEY) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    const matches = sampleJobs.filter((job) => {
      const countryMatch = country === 'All destinations' || job.country === country
      const companyMatch = companyType === 'all' || classifyCompany(job.company) === companyType
      const searchable = `${job.title} ${job.company} ${job.location} ${job.description} ${job.tags.join(' ')}`.toLowerCase()
      return countryMatch && companyMatch && words.every((word) => searchable.includes(word))
    })
    const jobs = matches.map((job) => ({
      ...job,
      companyType: classifyCompany(job.company),
      url: `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} careers`)}`,
      applyUrl: `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} careers`)}`,
    }))
    return response.json({ jobs, source: 'Sample listings' })
  }

  // Try SerpAPI first
  async function trySerpApi() {
    const searchUrl = new URL('https://serpapi.com/search.json')
    searchUrl.searchParams.set('engine', 'google_jobs')
    searchUrl.searchParams.set('q', `${query} visa sponsorship`)
    searchUrl.searchParams.set('api_key', process.env.SERPAPI_KEY)
    if (companyType === 'startup') searchUrl.searchParams.set('q', `${query} visa sponsorship startup`)
    if (companyType === 'top-mnc') searchUrl.searchParams.set('q', `${query} visa sponsorship multinational company`)
    if (countryLocations[country]) searchUrl.searchParams.set('location', countryLocations[country])
    const result = await fetch(searchUrl)
    if (!result.ok) throw new Error(`Search provider returned ${result.status}`)
    const data = await result.json()
    if (data.error) throw new Error(data.error)
    return (data.jobs_results || []).map((job, index) => mapGoogleJob(job, index, query))
  }

  // Fallback to JSearch API (RapidAPI)
  async function tryJSearch() {
    if (!process.env.JSEARCH_KEY) return []
    const searchUrl = new URL('https://jsearch.p.rapidapi.com/search')
    searchUrl.searchParams.set('query', `${query} visa sponsorship ${country === 'All destinations' ? '' : country}`)
    searchUrl.searchParams.set('page', '1')
    searchUrl.searchParams.set('num_pages', '1')
    const result = await fetch(searchUrl, {
      headers: {
        'X-RapidAPI-Key': process.env.JSEARCH_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    })
    if (result.status === 403) throw new Error('JSearch subscription required')
    if (!result.ok) throw new Error(`JSearch returned ${result.status}`)
    const data = await result.json()
    if (data.error) throw new Error(data.error)
    return (data.data || []).map((job, index) => mapJSearchJob(job, index, query))
  }

  // Fallback to Adzuna API
  async function tryAdzuna() {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return []
    const countryCode = {
      Netherlands: 'nl', Germany: 'de', France: 'fr', Spain: 'es', Italy: 'it',
      Sweden: 'se', Poland: 'pl', Belgium: 'be', Austria: 'at', Switzerland: 'ch',
      'United Kingdom': 'gb', Australia: 'au', 'New Zealand': 'nz', Singapore: 'sg',
      Japan: 'jp', Ireland: 'ie', Denmark: 'dk', Norway: 'no', Finland: 'fi',
      Canada: 'ca', 'United States': 'us',
    }[country]
    if (!countryCode) return []
    const searchUrl = new URL(`https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`)
    searchUrl.searchParams.set('app_id', process.env.ADZUNA_APP_ID)
    searchUrl.searchParams.set('app_key', process.env.ADZUNA_APP_KEY)
    searchUrl.searchParams.set('what', query)
    searchUrl.searchParams.set('results_per_page', '20')
    searchUrl.searchParams.set('content-type', 'application/json')
    const result = await fetch(searchUrl)
    if (!result.ok) throw new Error(`Adzuna returned ${result.status}`)
    const data = await result.json()
    return (data.results || []).map((job, index) => ({
      id: `adzuna-${job.id}`,
      company: job.company?.display_name || 'Company not listed',
      title: job.title || query,
      location: job.location?.display_name || 'Location not listed',
      salary: job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max}` : job.salary_is_predicted ? 'Competitive' : '',
      posted: job.created ? new Date(job.created).toLocaleDateString() : 'Recently posted',
      workType: job.contract_type || 'Full-time',
      companyType: classifyCompany(job.company?.display_name || ''),
      sponsorshipEvidence: sponsorshipEvidence(job.description || '') ? 'Sponsorship mentioned' : 'Confirm with employer',
      description: job.description || '',
      tags: job.category?.label ? [job.category.label] : [],
      via: 'Adzuna',
      url: job.redirect_url,
      applyUrl: job.redirect_url,
    }))
  }

  // Fallback to IndianApi
  async function tryIndianApi() {
    if (!process.env.INDIAN_API_KEY) return []
    const searchUrl = new URL('https://api.indianapi.in/jobs/search')
    searchUrl.searchParams.set('query', `${query} visa sponsorship ${country === 'All destinations' ? '' : country}`)
    searchUrl.searchParams.set('limit', '20')
    const result = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.INDIAN_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    if (!result.ok) {
      const errorText = await result.text()
      console.error('IndianApi error:', result.status, errorText)
      throw new Error(`IndianApi returned ${result.status}`)
    }
    const data = await result.json()
    return (data.jobs || []).map((job, index) => ({
      id: `indianapi-${job.id || index}`,
      company: job.company_name || 'Company not listed',
      title: job.title || query,
      location: job.location || 'Location not listed',
      salary: job.salary || '',
      posted: job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently posted',
      workType: job.job_type || 'Full-time',
      companyType: classifyCompany(job.company_name || ''),
      sponsorshipEvidence: sponsorshipEvidence(job.description || '') ? 'Sponsorship mentioned' : 'Confirm with employer',
      description: job.description || '',
      tags: job.tags || [],
      via: 'IndianApi',
      url: job.apply_url || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title}`)}`,
      applyUrl: job.apply_url || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title} careers`)}`,
    }))
  }

  // Fallback to OpenWeb Ninja API
  async function tryOpenWebNinja() {
    if (!process.env.OPENWEB_NINJA_KEY) return []
    const searchUrl = new URL('https://openweb-ninja.p.rapidapi.com/jobs/search')
    searchUrl.searchParams.set('query', `${query} visa sponsorship ${country === 'All destinations' ? '' : country}`)
    searchUrl.searchParams.set('page', '1')
    const result = await fetch(searchUrl, {
      headers: {
        'X-RapidAPI-Key': process.env.OPENWEB_NINJA_KEY,
        'X-RapidAPI-Host': 'openweb-ninja.p.rapidapi.com',
      },
    })
    if (!result.ok) throw new Error(`OpenWeb Ninja returned ${result.status}`)
    const data = await result.json()
    return (data.jobs || []).map((job, index) => ({
      id: `openweb-${job.id || index}`,
      company: job.company_name || 'Company not listed',
      title: job.title || query,
      location: job.location || 'Location not listed',
      salary: job.salary || '',
      posted: job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently posted',
      workType: job.job_type || 'Full-time',
      companyType: classifyCompany(job.company_name || ''),
      sponsorshipEvidence: sponsorshipEvidence(job.description || '') ? 'Sponsorship mentioned' : 'Confirm with employer',
      description: job.description || '',
      tags: job.tags || [],
      via: 'OpenWeb Ninja',
      url: job.apply_url || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title}`)}`,
      applyUrl: job.apply_url || `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title} careers`)}`,
    }))
  }

  // Fallback to sample jobs for specific countries
  function getSampleJobs() {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return sampleJobs.filter((job) => {
      const countryMatch = country === 'All destinations' || job.country === country
      const companyMatch = companyType === 'all' || classifyCompany(job.company) === companyType
      const searchable = `${job.title} ${job.company} ${job.location} ${job.description} ${job.tags.join(' ')}`.toLowerCase()
      return countryMatch && companyMatch && words.every((word) => searchable.includes(word))
    }).map((job) => ({
      ...job,
      companyType: classifyCompany(job.company),
      url: `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} careers`)}`,
      applyUrl: `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} careers`)}`,
    }))
  }

  try {
    let jobs = await trySerpApi()
    // If SerpAPI returns no results or limited results, try JSearch
    if ((jobs.length === 0 || (jobs.length === 1 && jobs[0].company === 'Cash App')) && process.env.JSEARCH_KEY) {
      const jsearchJobs = await tryJSearch()
      if (jsearchJobs.length > 0) jobs = jsearchJobs
    }
    // If still no results, try Adzuna
    if (jobs.length === 0 && process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
      const adzunaJobs = await tryAdzuna()
      if (adzunaJobs.length > 0) jobs = adzunaJobs
    }
    // If still no results, try IndianApi
    if (jobs.length === 0 && process.env.INDIAN_API_KEY) {
      const indianApiJobs = await tryIndianApi()
      if (indianApiJobs.length > 0) jobs = indianApiJobs
    }
    // If still no results, try OpenWeb Ninja
    if (jobs.length === 0 && process.env.OPENWEB_NINJA_KEY) {
      const openWebJobs = await tryOpenWebNinja()
      if (openWebJobs.length > 0) jobs = openWebJobs
    }
    // Final fallback to sample jobs
    if (jobs.length === 0) {
      jobs = getSampleJobs()
    }
    const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
    response.json({ jobs: filtered, source: filtered.length > 0 && process.env.JSEARCH_KEY && jobs !== await trySerpApi() ? 'JSearch' : 'Google Jobs' })
  } catch (error) {
    // If SerpAPI fails, try JSearch
    if (process.env.JSEARCH_KEY) {
      try {
        const jobs = await tryJSearch()
        const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
        response.json({ jobs: filtered, source: 'JSearch' })
        return
      } catch (jsearchError) {
        console.error('JSearch fallback failed:', jsearchError.message)
        // Try Adzuna as fallback
        if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
          try {
            const jobs = await tryAdzuna()
            const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
            response.json({ jobs: filtered, source: 'Adzuna' })
            return
          } catch (adzunaError) {
            console.error('Adzuna fallback failed:', adzunaError.message)
          }
        }
        // Try IndianApi as fallback
        if (process.env.INDIAN_API_KEY) {
          try {
            const jobs = await tryIndianApi()
            const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
            response.json({ jobs: filtered, source: 'IndianApi' })
            return
          } catch (indianApiError) {
            console.error('IndianApi fallback failed:', indianApiError.message)
          }
        }
        // Try OpenWeb Ninja as fallback
        if (process.env.OPENWEB_NINJA_KEY) {
          try {
            const jobs = await tryOpenWebNinja()
            const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
            response.json({ jobs: filtered, source: 'OpenWeb Ninja' })
            return
          } catch (openWebError) {
            console.error('OpenWeb Ninja fallback failed:', openWebError.message)
          }
        }
      }
    }
    // Final fallback to sample jobs
    const jobs = getSampleJobs()
    const filtered = jobs.filter((job) => companyType === 'all' || job.companyType === companyType)
    response.json({ jobs: filtered, source: 'Sample listings' })
  }
})

app.get('/api/local-applications', async (request, response) => {
  if (process.env.ALLOW_LOCAL_MIGRATION !== 'true') {
    return response.status(404).json({ error: 'Local application migration is disabled.' })
  }
  const accessToken = request.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!accessToken) return response.status(401).json({ error: 'A valid Supabase session is required.' })
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) return response.status(503).json({ error: 'Supabase configuration is missing.' })
  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` },
    })
    if (!authResponse.ok) return response.status(401).json({ error: 'The Supabase session is invalid.' })
    response.json(await readApplications())
  } catch {
    response.status(503).json({ error: 'Could not read local applications.' })
  }
})

app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')))

app.listen(port, '0.0.0.0', () => console.log(`Job Atlas API listening on port ${port}`))
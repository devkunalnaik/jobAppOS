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
]

const countryLocations = {
  Netherlands: 'Netherlands', Germany: 'Germany', Ireland: 'Ireland', Sweden: 'Sweden',
  France: 'France', Spain: 'Spain', Italy: 'Italy', Denmark: 'Denmark', Norway: 'Norway',
  Finland: 'Finland', Belgium: 'Belgium', Austria: 'Austria', Switzerland: 'Switzerland', Poland: 'Poland',
  'United Kingdom': 'United Kingdom', Australia: 'Australia', 'New Zealand': 'New Zealand',
  Singapore: 'Singapore', Japan: 'Japan',
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

  try {
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
    const jobs = (data.jobs_results || [])
      .map((job, index) => mapGoogleJob(job, index, query))
      .filter((job) => companyType === 'all' || job.companyType === companyType)
    response.json({ jobs, source: 'Google Jobs' })
  } catch (error) {
    response.status(502).json({ error: `Live job search failed: ${error.message}` })
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
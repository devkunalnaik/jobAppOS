import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownAZ, ArrowRight, ArrowUpRight, Bookmark, BriefcaseBusiness, CalendarDays, Check,
  CheckCircle2, ChevronDown, CircleHelp, Clock3, ExternalLink, FileText, Filter,
  Globe2, LayoutDashboard, LogOut, MapPin, Search, Send, Sparkles, Trash2, X,
} from 'lucide-react'
import AuthScreen from './AuthScreen.jsx'
import ResumeStudio from './ResumeStudio.jsx'
import { isSupabaseConfigured, supabase } from './supabase.js'
import './App.css'

const destinations = ['All destinations', 'Netherlands', 'Germany', 'Ireland', 'Sweden', 'United Kingdom', 'France', 'Spain', 'Italy', 'Denmark', 'Norway', 'Finland', 'Belgium', 'Austria', 'Switzerland', 'Poland', 'Australia', 'New Zealand', 'Singapore', 'Japan']
const companyTypes = [{ id: 'all', label: 'All companies' }, { id: 'startup', label: 'Startups' }, { id: 'top-mnc', label: 'Top MNCs' }]
const statusOptions = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']
const initialQuery = 'Engineer'
const initialDestination = 'All destinations'
const todayLabel = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())
const sortReferenceTime = Date.now()

function getPostingAge(posted) {
  const label = String(posted || '').trim()
  const relativeMatch = label.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i)
  if (relativeMatch) {
    const units = { minute: 60_000, hour: 3_600_000, day: 86_400_000, week: 604_800_000, month: 2_592_000_000, year: 31_536_000_000 }
    return Number(relativeMatch[1]) * units[relativeMatch[2].toLowerCase()]
  }
  if (/just now|today/i.test(label)) return 0
  if (/recently listed|date not listed/i.test(label)) return null
  if (/yesterday/i.test(label)) return 86_400_000
  const parsed = Date.parse(label)
  return Number.isNaN(parsed) ? null : Math.max(0, sortReferenceTime - parsed)
}

function mapApplication(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    job: row.job,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function currentIsoTimestamp() {
  return new Date().toISOString()
}

function App() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [legacyApplications, setLegacyApplications] = useState([])
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [query, setQuery] = useState(initialQuery)
  const [destination, setDestination] = useState(initialDestination)
  const [companyType, setCompanyType] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState('discover')
  const [selectedJob, setSelectedJob] = useState(null)
  const [source, setSource] = useState('Sample listings')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
      setAuthReady(true)
      if (!session?.user) {
        setApplications([])
        setLegacyApplications([])
      }
    })
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      setAuthUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function searchJobs(searchQuery = query, searchDestination = destination, searchCompanyType = companyType) {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ query: searchQuery, country: searchDestination, companyType: searchCompanyType })
      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) throw new Error('Job search is temporarily unavailable.')
      const result = await response.json()
      setJobs(result.jobs)
      setSource(result.source)
      setSelectedJob((current) => result.jobs.find((job) => job.id === current?.id) ?? result.jobs[0] ?? null)
    } catch {
      setError('Job search could not connect. Check your connection and try again.')
      setJobs([])
      setSelectedJob(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const params = new URLSearchParams({ query: initialQuery, country: initialDestination, companyType: 'all' })
        const jobsResponse = await fetch(`/api/jobs?${params}`)
        const result = jobsResponse.ok ? await jobsResponse.json() : null
        if (!active) return
        if (!result) throw new Error('Job search is temporarily unavailable.')
        setJobs(result.jobs)
        setSource(result.source)
        setSelectedJob(result.jobs[0] ?? null)
      } catch {
        if (active) setError('Could not load jobs right now. Check your connection and use Search jobs to retry.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!supabase || !authUser) return undefined
    let active = true
    async function loadApplications() {
      try {
        const { data, error: queryError } = await supabase
          .from('job_applications')
          .select('id, job_id, job, status, created_at, updated_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (!active) return
        setApplications((data || []).map(mapApplication))

        if (data?.length === 0 && import.meta.env.DEV) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.access_token) return
          const response = await fetch('/api/local-applications', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (!response.ok) return
          const legacy = await response.json()
          if (active && Array.isArray(legacy)) setLegacyApplications(legacy)
        }
      } catch (queryError) {
        if (active) setError(`Could not load your applications: ${queryError.message}`)
      }
    }
    loadApplications()
    return () => { active = false }
  }, [authUser])

  async function trackJob(job, status) {
    try {
      const { data, error: saveError } = await supabase
        .from('job_applications')
        .upsert({
          user_id: authUser.id,
          job_id: job.id,
          job,
          status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,job_id' })
        .select('id, job_id, job, status, created_at, updated_at')
        .single()
      if (saveError) throw saveError
      const result = mapApplication(data)
      setApplications((current) => [result, ...current.filter((application) => application.jobId !== job.id)])
      setNotice(status === 'Applied' ? 'Application added to your tracker.' : 'Role saved to your tracker.')
      window.setTimeout(() => setNotice(''), 2600)
    } catch (requestError) {
      setError(requestError.message || 'Could not save this role.')
    }
  }

  async function importLegacyApplications() {
    try {
      const rows = legacyApplications.map((application) => ({
        user_id: authUser.id,
        job_id: application.jobId || application.job.id,
        job: application.job,
        status: application.status,
        created_at: application.createdAt,
        updated_at: application.updatedAt || application.createdAt,
      }))
      const { data, error: importError } = await supabase
        .from('job_applications')
        .upsert(rows, { onConflict: 'user_id,job_id' })
        .select('id, job_id, job, status, created_at, updated_at')
      if (importError) throw importError
      setApplications((data || []).map(mapApplication))
      setLegacyApplications([])
      setNotice(`Imported ${rows.length} local application${rows.length === 1 ? '' : 's'} to your account.`)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (importError) {
      setError(`Could not import local applications: ${importError.message}`)
    }
  }

  async function updateApplication(id, status) {
    try {
      const { data, error: updateError } = await supabase
        .from('job_applications')
        .update({ status, updated_at: currentIsoTimestamp() })
        .eq('id', id)
        .eq('user_id', authUser.id)
        .select('id, job_id, job, status, created_at, updated_at')
        .single()
      if (updateError) throw updateError
      const updated = mapApplication(data)
      setApplications((current) => current.map((application) => application.id === id ? updated : application))
    } catch (updateError) {
      setError(`Could not update this application: ${updateError.message}`)
    }
  }

  async function deleteApplication(id) {
    const { error: deleteError } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', authUser.id)
    if (deleteError) {
      setError(`Could not remove this application: ${deleteError.message}`)
      return
    }
    setApplications((current) => current.filter((application) => application.id !== id))
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(signOutError.message)
  }

  function handleApply(job) {
    window.open(job.applyUrl || job.url, '_blank', 'noopener,noreferrer')
    trackJob(job, 'Applied')
  }

  const visibleApplications = useMemo(() => statusFilter === 'All'
    ? applications
    : applications.filter((application) => application.status === statusFilter), [applications, statusFilter])
  const sortedJobs = useMemo(() => [...jobs].sort((first, second) => {
    if (sortOrder === 'alphabetical') return first.company.localeCompare(second.company, undefined, { sensitivity: 'base' })
    const firstAge = getPostingAge(first.posted)
    const secondAge = getPostingAge(second.posted)
    if (firstAge === null) return secondAge === null ? 0 : 1
    if (secondAge === null) return -1
    return sortOrder === 'oldest' ? secondAge - firstAge : firstAge - secondAge
  }), [jobs, sortOrder])
  const savedCount = applications.filter((application) => application.status === 'Saved').length
  const appliedCount = applications.filter((application) => application.status !== 'Saved').length
  const interviewCount = applications.filter((application) => application.status === 'Interviewing').length
  const selectedApplication = applications.find((application) => application.jobId === selectedJob?.id)

  if (!isSupabaseConfigured) return <AuthScreen configurationMissing />
  if (!authReady) return <div className="auth-loading"><span className="spinner" /> Connecting your private workspace…</div>
  if (!authUser) return <AuthScreen />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#discover" onClick={() => setPage('discover')}>
          <span className="brand-mark"><Globe2 size={19} strokeWidth={2.2} /></span>
          <span>Job Atlas<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={page === 'discover' ? 'nav-link active' : 'nav-link'} aria-label="Discover jobs" title="Discover jobs" onClick={() => setPage('discover')}><LayoutDashboard size={18} /><span>Discover jobs</span><span className="nav-count">{jobs.length}</span></button>
          <button className={page === 'applications' ? 'nav-link active' : 'nav-link'} aria-label="Applications" title="Applications" onClick={() => setPage('applications')}><BriefcaseBusiness size={18} /><span>Applications</span><span className="nav-count">{applications.length}</span></button>
          <button className={page === 'resume' ? 'nav-link active' : 'nav-link'} aria-label="Resume studio" title="Resume studio" onClick={() => setPage('resume')}><FileText size={18} /><span>Resume studio</span></button>
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">YOUR ACTIVITY</div>
        <div className="activity-stat"><span className="activity-dot mint" /><span>Saved roles</span><strong>{savedCount}</strong></div>
        <div className="activity-stat"><span className="activity-dot coral" /><span>In progress</span><strong>{appliedCount}</strong></div>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip"><span className="tip-icon"><Sparkles size={16} /></span><strong>Make your next move</strong><p>Keep every opportunity and follow-up in one place.</p><button onClick={() => setPage('applications')}>View your pipeline <ArrowRight size={14} /></button></div>
        <button className="profile-button" aria-label="Sign out" title="Sign out" onClick={signOut}><span className="avatar">{authUser.email?.slice(0, 2).toUpperCase() || 'ME'}</span><span className="profile-text"><strong>{authUser.email}</strong><small>Private account</small></span><LogOut size={16} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Global opportunity desk</span><span className="breadcrumb-slash">/</span><strong>{page === 'discover' ? 'Discover' : page === 'applications' ? 'Applications' : 'Resume studio'}</strong></div>
          <div className="topbar-actions"><span className="today-label"><CalendarDays size={15} /> {todayLabel}</span><button className="icon-button help-button" title="Help"><CircleHelp size={18} /></button></div>
        </header>
        {legacyApplications.length > 0 && <div className="legacy-import-banner"><div><strong>Found {legacyApplications.length} applications on this device</strong><span>Import them into your private Supabase account?</span></div><button className="legacy-import-button" onClick={importLegacyApplications}>Import applications</button><button className="legacy-skip-button" onClick={() => setLegacyApplications([])}>Skip</button></div>}

        {page === 'discover' ? (
          <div className="page-content discover-page">
            <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> GLOBAL CAREER SEARCH</div><h1>Find work that <em>travels.</em></h1><p className="welcome-copy">Visa-sponsored opportunities, gathered across borders.</p></div><div className="welcome-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-center"><Globe2 size={25} /></span><span className="orbit-node node-one" /><span className="orbit-node node-two" /><span className="orbit-node node-three" /></div></section>

            <section className="search-panel" aria-label="Search jobs">
              <form className="search-form" onSubmit={(event) => { event.preventDefault(); searchJobs() }}>
                <label className="search-field"><Search size={19} /><span className="sr-only">Job title or keyword</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job title, skill, or company" /></label>
                <span className="search-divider" />
                <label className="destination-field"><MapPin size={18} /><span className="sr-only">Destination</span><select value={destination} onChange={(event) => { setDestination(event.target.value); searchJobs(query, event.target.value) }}>{destinations.map((country) => <option key={country}>{country}</option>)}</select><ChevronDown className="select-chevron" size={15} /></label>
                <button className="search-button" type="submit">Search jobs <ArrowRight size={16} /></button>
              </form>
              <div className="search-foot"><span><span className="live-pulse" /> Visa sponsorship focused</span><span>Europe <b>·</b> Australia <b>·</b> NZ <b>·</b> Singapore <b>·</b> Japan</span></div>
            </section>

            <div className="company-filter-bar"><span className="company-filter-label">COMPANY TYPE</span><div className="company-segment" role="group" aria-label="Filter by company type">{companyTypes.map((type) => <button key={type.id} className={companyType === type.id ? 'company-segment-button active' : 'company-segment-button'} onClick={() => { setCompanyType(type.id); searchJobs(query, destination, type.id) }}>{type.label}</button>)}</div></div>

            <section className="metric-strip" aria-label="Application overview">
              <div className="metric"><span className="metric-icon green"><Bookmark size={17} /></span><span className="metric-copy"><small>Saved roles</small><strong>{savedCount.toString().padStart(2, '0')}</strong></span><span className="metric-note">ready when you are</span></div>
              <div className="metric"><span className="metric-icon orange"><Send size={17} /></span><span className="metric-copy"><small>Applications sent</small><strong>{appliedCount.toString().padStart(2, '0')}</strong></span><span className="metric-note">in your pipeline</span></div>
              <div className="metric"><span className="metric-icon blue"><CalendarDays size={17} /></span><span className="metric-copy"><small>Interviewing</small><strong>{interviewCount.toString().padStart(2, '0')}</strong></span><span className="metric-note">keep the momentum</span></div>
            </section>

            <div className="results-heading"><div><h2>Opportunities for you</h2><p>{loading ? 'Searching across destinations...' : `${jobs.length} roles to explore`} <span className="result-dot">·</span> <span className="source-label"><span className={source === 'Google Jobs' ? 'source-indicator live' : 'source-indicator'} />{source}</span></p></div><div className="results-actions"><label className="job-sort-control"><ArrowDownAZ size={15} /><span className="sr-only">Sort jobs</span><select aria-label="Sort jobs" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="alphabetical">Alphabetical (company)</option></select><ChevronDown size={13} /></label><button className="filter-button" onClick={() => { setDestination('All destinations'); searchJobs(query, 'All destinations') }}><Filter size={15} /> Reset filters</button></div></div>
            {source === 'Sample listings' && <div className="demo-notice"><Sparkles size={15} /><span>Showing sample listings. Add <code>SERPAPI_KEY</code> to <code>.env</code> to search live Google Jobs results.</span></div>}
            {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}

            <section className="job-workspace">
              <div className="job-list" aria-label="Job results">
                {loading ? <div className="loading-state"><span className="spinner" /> Finding sponsored roles</div> : sortedJobs.length === 0 ? <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><strong>No roles found</strong><p>Try another title or destination.</p></div> : sortedJobs.map((job) => (
                  <button key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => setSelectedJob(job)}>
                    <span className={`company-mark mark-${job.accent || 'green'}`}>{job.company.slice(0, 1).toUpperCase()}</span>
                    <span className="job-card-body"><span className="job-company-line"><span className="job-company-name"><strong>{job.company}</strong>{job.companyType !== 'other' && <span className={`company-type-pill type-${job.companyType}`}>{job.companyType === 'top-mnc' ? 'MNC' : 'Startup'}</span>}</span><span className="job-posted"><Clock3 size={12} />{job.posted}</span></span><span className="job-title-line">{job.title}</span><span className="job-card-meta"><span><MapPin size={13} />{job.location}</span><span className="meta-dot">·</span><span>{job.workType || 'Full-time'}</span></span><span className="job-card-bottom"><span className="sponsor-tag"><Check size={12} /> {job.sponsorshipEvidence || 'Sponsorship noted'}</span><span className="salary-label">{job.salary || 'Salary not listed'}</span></span></span><ArrowUpRight className="card-arrow" size={16} />
                  </button>
                ))}
              </div>

              {selectedJob && <article className="job-detail">
                <div className="detail-topline"><span className="detail-match"><Sparkles size={13} /> Sponsorship match</span><button className="icon-button detail-close" onClick={() => setSelectedJob(null)} aria-label="Close job details"><X size={17} /></button></div>
                <div className="detail-company"><span className={`company-mark large mark-${selectedJob.accent || 'green'}`}>{selectedJob.company.slice(0, 1).toUpperCase()}</span><span><strong>{selectedJob.company}</strong><small>{selectedJob.via ? `Listed via ${selectedJob.via}` : 'International hiring'}</small></span></div>
                <h3>{selectedJob.title}</h3><div className="detail-location"><MapPin size={15} /> {selectedJob.location}<span>·</span>{selectedJob.workType || 'Full-time'}</div>
                <div className="detail-tags"><span>{selectedJob.salary || 'Compensation not listed'}</span><span>{selectedJob.posted || 'Recently listed'}</span></div><div className="detail-rule" />
                <div className="detail-section-title"><h4>Why this role fits</h4><span className="verified-label"><CheckCircle2 size={13} /> {selectedJob.sponsorshipEvidence || 'Sponsorship noted'}</span></div>
                <p className="detail-description">{selectedJob.description || `${selectedJob.company} is looking for a ${selectedJob.title} to join their ${selectedJob.location} team. Review the full role details and confirm visa sponsorship with the employer before applying.`}</p>
                <div className="detail-skills">{(selectedJob.tags || ['International team', 'Relocation support', 'Full-time']).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="sponsor-callout"><span className="callout-icon"><Globe2 size={16} /></span><p><strong>Check sponsorship details</strong><br />Confirm eligibility, visa type, and relocation support in the original listing.</p></div>
                <div className="detail-actions"><button className="apply-button" onClick={() => handleApply(selectedJob)}><span>Apply &amp; track</span><ExternalLink size={15} /></button><button className={`save-button ${selectedApplication ? 'is-saved' : ''}`} onClick={() => trackJob(selectedJob, 'Saved')} title="Save role">{selectedApplication ? <Check size={17} /> : <Bookmark size={17} />}</button></div>
                <a className="original-link" href={selectedJob.url || selectedJob.applyUrl} target="_blank" rel="noreferrer">View original listing <ArrowUpRight size={14} /></a>
                <button className="tailor-resume-button" onClick={() => setPage('resume')}><FileText size={14} /> Tailor resume for this role</button>
              </article>}
            </section>
          </div>
        ) : page === 'applications' ? (
          <div className="page-content applications-page">
            <section className="applications-header"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR JOB SEARCH</div><h1>Application <em>pipeline.</em></h1><p className="welcome-copy">A clear view of every role you’re moving forward.</p></div><div className="pipeline-total"><span>ACTIVE TRACKER</span><strong>{applications.length.toString().padStart(2, '0')}</strong><small>roles tracked</small></div></section>
            <section className="pipeline-summary"><div><span className="summary-dot saved-dot" /><strong>{savedCount.toString().padStart(2, '0')}</strong><small>Saved</small></div><div><span className="summary-dot applied-dot" /><strong>{appliedCount.toString().padStart(2, '0')}</strong><small>Applied</small></div><div><span className="summary-dot interview-dot" /><strong>{interviewCount.toString().padStart(2, '0')}</strong><small>Interviewing</small></div><div><span className="summary-dot offer-dot" /><strong>{applications.filter((application) => application.status === 'Offer').length.toString().padStart(2, '0')}</strong><small>Offers</small></div></section>
            <div className="pipeline-toolbar"><div><h2>Your applications</h2><p>Update a role as it moves through your search.</p></div><label className="status-select-wrap"><Filter size={14} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label></div>
            {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
            {visibleApplications.length === 0 ? <div className="applications-empty"><div className="empty-icon"><FileText size={22} /></div><h3>{applications.length === 0 ? 'Your pipeline starts here' : 'No roles in this stage'}</h3><p>{applications.length === 0 ? 'Save a role or choose “Apply & track” to keep your search organized.' : 'Choose another status to see more of your applications.'}</p><button className="empty-action" onClick={() => setPage('discover')}>Explore sponsored roles <ArrowRight size={15} /></button></div> : (
              <div className="application-table-wrap"><table className="application-table"><thead><tr><th>ROLE</th><th>DESTINATION</th><th>DATE ADDED</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>{visibleApplications.map((application) => <tr key={application.id}><td><div className="table-role"><span className={`company-mark table-mark mark-${application.job.accent || 'green'}`}>{application.job.company.slice(0, 1).toUpperCase()}</span><span><strong>{application.job.title}</strong><small>{application.job.company}</small></span></div></td><td><span className="table-location"><MapPin size={13} />{application.job.location}</span></td><td><span className="table-date">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(application.createdAt))}</span></td><td><label className={`status-pill status-${application.status.toLowerCase()}`}><select value={application.status} onChange={(event) => updateApplication(application.id, event.target.value)} aria-label={`Status for ${application.job.title}`}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={12} /></label></td><td><button className="delete-button" onClick={() => deleteApplication(application.id)} title="Remove from tracker" aria-label={`Remove ${application.job.title}`}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
            )}
            <div className="pipeline-footnote"><CircleHelp size={15} /><span>Statuses are saved on this device and can be updated at any time.</span></div>
          </div>
        ) : (
          <div className="page-content resume-page">
            <ResumeStudio initialTargetRole={query} targetJob={selectedJob} />
          </div>
        )}
      </main>
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}</div>}
    </div>
  )
}

export default App

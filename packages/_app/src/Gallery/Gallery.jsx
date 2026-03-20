import { $setProjectId, loadProjectGraph } from '@agentix/store'
import { supabase } from '@agentix/util'
import { Button } from '@radix-ui/themes'
import { Link, useNavigate } from 'raviger'
import { useEffect, useMemo, useRef, useState } from 'react'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}


// % “fake” mais stable par projet (si tu n’as pas de champ progress)
function stablePercentFromId(id) {
  const s = String(id || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return 10 + (h % 91) // 10..100
}





export default function Gallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [search, setSearch] = useState('')

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  //profile menu toggle
  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current) return
      if (!profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const navigate = useNavigate()
  

  async function loadProjects() {
    setLoading(true)
    setError(null)

    const { data: userRes, error: userError } = await supabase.auth.getUser()
    const user = userRes?.user
    if (userError || !user) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return
    }

    console.log('USER METADATA =>', user?.user_metadata)

    setDisplayName(user?.user_metadata?.name || user?.email || 'Utilisateur')

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, author, created_at') // adapte si tu as plus de champs
      .eq('user_id', user.id) // ✅ ne charge que les projets du user
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error(projectsError)
      setError(projectsError.message)
    } else {
      setProjects(projectsData ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await loadProjects()
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => {
      const t = String(p.title || '').toLowerCase()
      const a = String(p.author || '').toLowerCase()
      return t.includes(q) || a.includes(q)
    })
  }, [projects, search])

  async function deleteProject(id) {
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      console.error(error)
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  async function openProject(id) {
    setError(null)

    const { data: userRes, error: userError } = await supabase.auth.getUser()
    const user = userRes?.user
    if (userError || !user) {
      setError('Utilisateur non connecté')
      return
    }

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('data')
      .eq('id', id) // ✅ important
      .eq('user_id', user.id) // ✅ important
      .single()

    if (projectError) {
      console.error(projectError)
      setError(projectError.message)
      return
    }

    const nodes = projectData?.data?.nodes || []
    const edges = projectData?.data?.edges || []

    $setProjectId(id)
    loadProjectGraph(nodes, edges)
    navigate('/home')
  }

  const headerStyles = {
    container: {
      borderRadius: 18,
      padding: '35px 24px',
      backgroundColor: '#2f7ef6',
      color: 'white',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    left: { display: 'flex', flexDirection: 'column', gap: 17 },
    title: { fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.05 },
    subtitle: { margin: 0, opacity: 0.9, fontSize: 20 },
    actionsRow: { display: 'flex', gap: 10, marginTop: 2 },
    actionBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.65)',
      background: 'rgba(255,255,255,0.1)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 600,
    },
    profile: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: {
      position: 'relative',
      width: 34,
      height: 34,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.25)',
      display: 'grid',
      placeItems: 'center',
      fontWeight: 800,
      cursor: 'pointer',
    },
    profileMenu: { 
      display: 'block',
      position: 'absolute',
      right: 47,
      top: 78,
      background: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderRadius: 5,
     },
    profileText: { lineHeight: 1.1, textAlign: 'right' },
    profileName: { fontSize: 12, fontWeight: 700, opacity: 0.95 },
    profileRole: { fontSize: 11, opacity: 0.85 },
  }

  return (
    <main style={{ padding: '20px 22px' }}>
      {/* HEADER BLUE */}
      <section style={headerStyles.container}>
        <div style={headerStyles.left}>
          <h1 style={headerStyles.title}>Bienvenu {displayName || '...'} !</h1>
          <p style={headerStyles.subtitle}>
            Tu as actuellement {projects.length} projets en cours
          </p>

          <div style={headerStyles.actionsRow}>
            <button
              style={headerStyles.actionBtn}
              onClick={() => navigate('/Create')}>
              + Nouveau
            </button>
            <button
              style={headerStyles.actionBtn}
              onClick={loadProjects}>
              Recharger
            </button>
          </div>
        </div>

        <div style={headerStyles.profile}>
          <div style={headerStyles.profileText}>
            <div style={headerStyles.profileName}>{displayName || 'Utilisateur'}</div>
            <div style={headerStyles.profileRole}>Student</div>
          </div>
          <Button
            style={headerStyles.avatar}
            onClick={() => setIsProfileOpen((v) => !v)}
          >
            {(displayName || 'U').slice(0, 1).toUpperCase()}
          </Button>
          <div ref={profileRef} style={{
            ...headerStyles.profileMenu,
            display: isProfileOpen ? 'block' : 'none',}}>
            <ul style = {{padding:'5px', margin:"5px" , listStyle  : 'none'}}>
              <li >
                <Link style={{
                  textDecoration: 'none',
                  color: 'black', 
                }} 
                href="/">
                  Deconnexion
                  </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <div
          style={{
            width: '520px',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d1d5db',
            borderRadius: 999,
            padding: '10px 14px',
            gap: 10,
            background: 'white',
          }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Rechercher un projet...'
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: 14,
            }}
          />
          <span style={{ opacity: 0.55 }}>🔎</span>
        </div>
      </div>

      {/* STATE */}
      {loading && <p style={{ marginTop: 16 }}>Chargement des projets…</p>}
      {error && <p style={{ marginTop: 16, color: 'red' }}>Erreur : {error}</p>}

      {/* LIST */}
      {!loading && !error && filteredProjects.length === 0 && (
        <p style={{ marginTop: 16 }}>Aucun projet pour le moment.</p>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '120vh',
              maxWidth: '100%',

              // ✅ scroll ici
              maxHeight: 'calc(100vh - 260px)',
              overflowY: 'auto',
              paddingRight: 8,
              scrollbarGutter: 'stable',
            }}>
            {filteredProjects.map((p, idx) => {
              const percent = stablePercentFromId(p.id)
              const date = formatDate(p.created_at)
              const thumbBg = ['#f2b6b6', '#d9f0b3', '#b9d4f6', '#e7d7ff'][idx % 4]

              return (
                <div
                  key={p.id}
                  onClick={() => openProject(p.id)}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: 16,
                    borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    marginBottom: 14,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    position: 'relative',
                  }}>
                  {/* thumbnail */}
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 12,
                      background: thumbBg,
                      flex: '0 0 auto',
                    }}
                  />

                  {/* content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
                        {p.title || 'Sans titre'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                        {date}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Une petite introduction à {p.title || 'ton projet'}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                        {p.author ? `Cours par ${p.author}` : 'Cours rapide'}
                      </div>
                    </div>

                    {/* progress */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 14,
                      }}>
                      <div style={{ fontSize: 12, color: '#6b7280', width: 40 }}>
                        {percent}%
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: '#e5e7eb',
                          width: '100%',
                          overflow: 'hidden',
                        }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: '#2f7ef6',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'none',
                      border: '1px solid #fca5a5',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 12,
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}>
                    Supprimer
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 28,
            width: 360,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
              Supprimer ce projet ?
            </p>
            <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#6b7280' }}>
              Cette action est irréversible. Le projet sera définitivement supprimé.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                Annuler
              </button>
              <button
                onClick={() => deleteProject(confirmDeleteId)}
                disabled={deleting}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: deleting ? 0.7 : 1,
                }}>
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

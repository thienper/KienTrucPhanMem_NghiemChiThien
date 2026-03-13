import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ContentItem = {
  id: string
  name: string
  language: string
  bio: string
  version: number
}

type ContentForm = {
  name: string
  language: string
  bio: string
  version: string
}

const API_BASE = 'http://localhost:3000/api/content'

function App() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ContentForm>({
    name: '',
    language: '',
    bio: '',
    version: '1.0',
  })

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  )

  async function fetchItems() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error('Khong the tai du lieu tu backend')
      }

      const data = (await response.json()) as ContentItem[]
      setItems(data)
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Loi khong xac dinh'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm({
      name: '',
      language: '',
      bio: '',
      version: '1.0',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      name: form.name,
      language: form.language,
      bio: form.bio,
      version: Number(form.version),
    }

    try {
      const isUpdate = Boolean(editingId)
      const response = await fetch(isUpdate ? `${API_BASE}/${editingId}` : API_BASE, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = (await response.json()) as { message?: string }
        throw new Error(data.message || 'Khong the luu noi dung')
      }

      await fetchItems()
      resetForm()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Luu du lieu that bai'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      language: item.language,
      bio: item.bio,
      version: String(item.version),
    })
  }

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm('Ban chac chan muon xoa noi dung nay?')
    if (!shouldDelete) {
      return
    }

    setError('')
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Khong the xoa noi dung')
      }

      await fetchItems()
      if (editingId === id) {
        resetForm()
      }
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Xoa that bai'
      setError(message)
    }
  }

  return (
    <main className="cms-shell">
      <section className="hero-panel">
        <p className="eyebrow">Microkernel + Layered Architecture</p>
        <h1>Content Management Studio</h1>
        <p className="lead">
          Quan ly du lieu trong data.json bang 3 thao tac chinh: them, sua, xoa.
        </p>
      </section>

      <section className="grid-layout">
        <article className="panel">
          <h2>{editingId ? 'Cap nhat noi dung' : 'Them noi dung moi'}</h2>
          <form className="content-form" onSubmit={handleSubmit}>
            <label>
              Ten
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, name: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Ngon ngu
              <input
                value={form.language}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    language: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Version
              <input
                type="number"
                step="0.01"
                value={form.version}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    version: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Bio
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, bio: event.target.value }))
                }
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Dang luu...' : editingId ? 'Luu thay doi' : 'Them moi'}
              </button>
              {editingId && (
                <button type="button" className="ghost" onClick={resetForm}>
                  Huy sua
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="panel list-panel">
          <div className="list-header">
            <h2>Danh sach noi dung</h2>
            <button className="ghost" onClick={fetchItems}>
              Tai lai
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {loading ? (
            <p>Dang tai du lieu...</p>
          ) : (
            <ul className="content-list">
              {sortedItems.map((item) => (
                <li key={item.id}>
                  <header>
                    <h3>{item.name}</h3>
                    <span>v{item.version}</span>
                  </header>
                  <p className="meta">{item.language}</p>
                  <p>{item.bio}</p>
                  <div className="item-actions">
                    <button className="ghost" onClick={() => startEdit(item)}>
                      Sua
                    </button>
                    <button className="danger" onClick={() => handleDelete(item.id)}>
                      Xoa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  )
}

export default App

import { useState, useEffect } from 'react'
import axios from 'axios'

function UserTab({ apiBase }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ username: '', email: '', password: '' })
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${apiBase}/users`)
            setUsers(response.data)
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch users' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${apiBase}/users`, formData)
            setMessage({ type: 'success', text: 'User created successfully!' })
            setFormData({ username: '', email: '', password: '' })
            fetchUsers()
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create user' })
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div>
            <div className="grid">
                <div className="card">
                    <h3>Create New User</h3>
                    {message && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="john_doe"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="button button-primary">Create User</button>
                    </form>
                </div>

                <div className="card">
                    <h3>All Users</h3>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <ul className="list">
                            {users.map(user => (
                                <li key={user.id} className="list-item">
                                    <strong>{user.username}</strong><br />
                                    {user.email}
                                </li>
                            ))}
                            {users.length === 0 && <p>No users found</p>}
                        </ul>
                    )}
                    <button onClick={fetchUsers} className="button button-secondary" style={{ marginTop: '10px' }}>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserTab

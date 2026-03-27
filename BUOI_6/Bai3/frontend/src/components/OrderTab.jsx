import { useState, useEffect } from 'react'
import axios from 'axios'

function OrderTab({ apiBase }) {
    const [orders, setOrders] = useState([])
    const [users, setUsers] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: '' })
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [ordersRes, usersRes, productsRes] = await Promise.all([
                axios.get(`${apiBase}/orders`),
                axios.get(`${apiBase}/users`),
                axios.get(`${apiBase}/products`)
            ])
            setOrders(ordersRes.data)
            setUsers(usersRes.data)
            setProducts(productsRes.data)
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch data' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${apiBase}/orders`, {
                user_id: parseInt(formData.user_id),
                product_id: parseInt(formData.product_id),
                quantity: parseInt(formData.quantity)
            })
            setMessage({ type: 'success', text: 'Order created successfully!' })
            setFormData({ user_id: '', product_id: '', quantity: '' })
            fetchData()
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create order' })
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
                    <h3>Create New Order</h3>
                    {message && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Customer</label>
                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Product</label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a product...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} (${parseFloat(product.price).toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="1"
                                min="1"
                                required
                            />
                        </div>
                        <button type="submit" className="button button-primary">Create Order</button>
                    </form>
                </div>

                <div className="card">
                    <h3>All Orders</h3>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <ul className="list">
                            {orders.map(order => (
                                <li key={order.id} className="list-item">
                                    <strong>Order #{order.id}</strong><br />
                                    👤 {order.username || 'Unknown'}<br />
                                    📦 {order.name || 'Unknown'} x{order.quantity}<br />
                                    💰 ${parseFloat(order.total_price || 0).toFixed(2)}
                                </li>
                            ))}
                            {orders.length === 0 && <p>No orders found</p>}
                        </ul>
                    )}
                    <button onClick={fetchData} className="button button-secondary" style={{ marginTop: '10px' }}>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderTab

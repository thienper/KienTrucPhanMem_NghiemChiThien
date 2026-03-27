import { useState, useEffect } from 'react'
import axios from 'axios'

function ProductTab({ apiBase }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' })
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${apiBase}/products`)
            setProducts(response.data)
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch products' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${apiBase}/products`, {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            })
            setMessage({ type: 'success', text: 'Product created successfully!' })
            setFormData({ name: '', description: '', price: '', stock: '' })
            fetchProducts()
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create product' })
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
                    <h3>Add New Product</h3>
                    {message && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Laptop Pro"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="High-performance laptop"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="999.99"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="10"
                                required
                            />
                        </div>
                        <button type="submit" className="button button-primary">Add Product</button>
                    </form>
                </div>

                <div className="card">
                    <h3>All Products</h3>
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <ul className="list">
                            {products.map(product => (
                                <li key={product.id} className="list-item">
                                    <strong>{product.name}</strong><br />
                                    Price: ${parseFloat(product.price).toFixed(2)} | Stock: {product.stock}
                                </li>
                            ))}
                            {products.length === 0 && <p>No products found</p>}
                        </ul>
                    )}
                    <button onClick={fetchProducts} className="button button-secondary" style={{ marginTop: '10px' }}>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductTab

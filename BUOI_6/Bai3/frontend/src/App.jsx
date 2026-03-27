import { useState, useEffect } from 'react'
import axios from 'axios'
import UserTab from './components/UserTab'
import ProductTab from './components/ProductTab'
import OrderTab from './components/OrderTab'
import ArchitectureInfo from './components/ArchitectureInfo'
import './App.css'

// ===== PART 2: 3 Functions Configuration =====
const API_CONFIG = {
    user: 'http://localhost:3001/api',
    product: 'http://localhost:3002/api',
    order: 'http://localhost:3003/api'
}

// For Part 1 Monolith, use:
// const API_BASE_URL = 'http://localhost:4000/api'
// For Part 3 Service-Based, use:
// const API_BASE_URL = 'http://localhost:5000/api'

function App() {
    const [activeTab, setActiveTab] = useState('info')
    const [servicesStatus, setServicesStatus] = useState(null)
    const [architecture, setArchitecture] = useState('Part 2: 3 Functions')

    useEffect(() => {
        checkHealth()
        const interval = setInterval(checkHealth, 10000)
        return () => clearInterval(interval)
    }, [])

    const checkHealth = async () => {
        try {
            const userStatus = await axios.get(API_CONFIG.user.replace('/api', '/health')).catch(() => ({ data: { status: 'down' } }))
            const productStatus = await axios.get(API_CONFIG.product.replace('/api', '/health')).catch(() => ({ data: { status: 'down' } }))
            const orderStatus = await axios.get(API_CONFIG.order.replace('/api', '/health')).catch(() => ({ data: { status: 'down' } }))

            setServicesStatus({
                user: userStatus.data,
                product: productStatus.data,
                order: orderStatus.data
            })
        } catch (err) {
            console.log('Health check failed')
        }
    }

    return (
        <div className="app">
            <div className="header">
                <h1>🏗️ Architecture Evolution Demo</h1>
                <p>Monolith → 3 Functions → Service-Based Architecture</p>
                <div className="header-status">
                    <span className="status-badge success">
                        ✓ {architecture}
                    </span>
                </div>
            </div>

            <div className="container">
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        📖 Architecture Info
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👤 Users
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Products
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        📋 Orders
                    </button>
                </div>

                <div className={`tab-content ${activeTab === 'info' ? 'active' : ''}`}>
                    <ArchitectureInfo servicesStatus={servicesStatus} />
                </div>

                <div className={`tab-content ${activeTab === 'users' ? 'active' : ''}`}>
                    <UserTab apiBase={API_CONFIG.user} />
                </div>

                <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
                    <ProductTab apiBase={API_CONFIG.product} />
                </div>

                <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
                    <OrderTab apiBase={API_CONFIG.order} />
                </div>
            </div>
        </div>
    )
}

export default App

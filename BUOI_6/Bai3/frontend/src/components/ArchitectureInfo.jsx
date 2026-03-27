function ArchitectureInfo({ servicesStatus }) {
    return (
        <div>
            <div className="info-box">
                <strong>ℹ️ Architecture Visualization</strong>
                <p>This demo showcases 3 different architectural patterns for the same application.</p>
            </div>

            <div className="grid">
                <div className="card">
                    <h3>📦 Part 1: Monolith</h3>
                    <p><strong>Port:</strong> 4000</p>
                    <p><strong>Characteristics:</strong></p>
                    <ul className="list">
                        <li className="list-item">Single application instance</li>
                        <li className="list-item">All logic in one codebase</li>
                        <li className="list-item">Internal function calls</li>
                        <li className="list-item">Single deployment unit</li>
                    </ul>
                </div>

                <div className="card">
                    <h3>🔀 Part 2: 3 Functions</h3>
                    <p><strong>Ports:</strong> 3001, 3002, 3003</p>
                    <p><strong>Configuration:</strong></p>
                    <ul className="list">
                        <li className="list-item">User Service: 3001</li>
                        <li className="list-item">Product Service: 3002</li>
                        <li className="list-item">Order Service: 3003</li>
                    </ul>
                </div>

                <div className="card">
                    <h3>🌐 Part 3: Service-Based (Current)</h3>
                    <p><strong>Ports:</strong></p>
                    <ul className="list">
                        <li className="list-item">API Gateway: 5000</li>
                        <li className="list-item">User Service: 5001</li>
                        <li className="list-item">Product Service: 5002</li>
                        <li className="list-item">Order Service: 5003</li>
                    </ul>
                </div>
            </div>

            <div className="stats">
                <div className="stat-card">
                    <h4>Current Architecture</h4>
                    <div className="value">Part 3</div>
                    <p>Service-Based with API Gateway</p>
                </div>
                <div className="stat-card">
                    <h4>Database Port</h4>
                    <div className="value">5432</div>
                    <p>PostgreSQL (Shared)</p>
                </div>
                <div className="stat-card">
                    <h4>Frontend Port</h4>
                    <div className="value">3000</div>
                    <p>React (You are here)</p>
                </div>
            </div>

            {servicesStatus && (
                <div className="card">
                    <h3>🔗 Service Status</h3>
                    <div className="grid">
                        {servicesStatus.user && (
                            <div className="stat-card">
                                <h4>👤 User Service</h4>
                                <p className="status-info">{servicesStatus.user.status}</p>
                                <p className="text-small">Port: {servicesStatus.user.port}</p>
                            </div>
                        )}
                        {servicesStatus.product && (
                            <div className="stat-card">
                                <h4>📦 Product Service</h4>
                                <p className="status-info">{servicesStatus.product.status}</p>
                                <p className="text-small">Port: {servicesStatus.product.port}</p>
                            </div>
                        )}
                        {servicesStatus.order && (
                            <div className="stat-card">
                                <h4>📋 Order Service</h4>
                                <p className="status-info">{servicesStatus.order.status}</p>
                                <p className="text-small">Port: {servicesStatus.order.port}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="card">
                <h3>📚 Architecture Comparison</h3>
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>Aspect</th>
                            <th>Monolith</th>
                            <th>Functions</th>
                            <th>Service-Based</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Complexity</strong></td>
                            <td>Low</td>
                            <td>Medium</td>
                            <td>High</td>
                        </tr>
                        <tr>
                            <td><strong>Scalability</strong></td>
                            <td>Limited</td>
                            <td>Good</td>
                            <td>Excellent</td>
                        </tr>
                        <tr>
                            <td><strong>Entry Points</strong></td>
                            <td>1</td>
                            <td>3</td>
                            <td>1 (Gateway)</td>
                        </tr>
                        <tr>
                            <td><strong>Communication</strong></td>
                            <td>Internal</td>
                            <td>HTTP API</td>
                            <td>HTTP API</td>
                        </tr>
                        <tr>
                            <td><strong>Deployment</strong></td>
                            <td>Together</td>
                            <td>Separate</td>
                            <td>Separate</td>
                        </tr>
                        <tr>
                            <td><strong>Team Structure</strong></td>
                            <td>Single Team</td>
                            <td>Multiple Teams</td>
                            <td>Multiple Teams</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>🎯 Key Takeaways</h3>
                <ul className="list">
                    <li className="list-item">
                        <strong>Monolith:</strong> Great for startups, simple to implement
                    </li>
                    <li className="list-item">
                        <strong>Functions:</strong> Better for growing teams, independent scaling
                    </li>
                    <li className="list-item">
                        <strong>Service-Based:</strong> Enterprise-ready, centralized management via Gateway
                    </li>
                    <li className="list-item">
                        <strong>All use same DB:</strong> Easy to compare, focus on architecture patterns
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default ArchitectureInfo

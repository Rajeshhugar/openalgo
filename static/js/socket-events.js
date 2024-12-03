// Function to fetch and update logs
async function refreshLogs() {
    try {
        const response = await fetch('/logs');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newContent = tempDiv.querySelector('#logs-container');
        if (newContent) {
            const currentContainer = document.getElementById('logs-container');
            if (currentContainer) {
                currentContainer.innerHTML = newContent.innerHTML;
            }
        }
    } catch (error) {
        console.error('Error refreshing logs:', error);
    }
}

// Function to fetch and update orderbook
async function refreshOrderbook() {
    try {
        const response = await fetch('/orderbook');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Update stats grid
        const newStatsGrid = tempDiv.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-5');
        if (newStatsGrid) {
            const currentStatsGrid = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-5');
            if (currentStatsGrid) {
                currentStatsGrid.innerHTML = newStatsGrid.innerHTML;
            }
        }
        
        // Update table
        const newContent = tempDiv.querySelector('.table-container');
        if (newContent) {
            const currentContainer = document.querySelector('.table-container');
            if (currentContainer) {
                currentContainer.innerHTML = newContent.innerHTML;
            }
        }
    } catch (error) {
        console.error('Error refreshing orderbook:', error);
    }
}

// Function to fetch and update tradebook
async function refreshTradebook() {
    try {
        const response = await fetch('/tradebook');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Update stats
        const newStats = tempDiv.querySelector('.stats');
        if (newStats) {
            const currentStats = document.querySelector('.stats');
            if (currentStats) {
                currentStats.innerHTML = newStats.innerHTML;
            }
        }
        
        // Update table
        const newContent = tempDiv.querySelector('.table-container');
        if (newContent) {
            const currentContainer = document.querySelector('.table-container');
            if (currentContainer) {
                currentContainer.innerHTML = newContent.innerHTML;
            }
        }
    } catch (error) {
        console.error('Error refreshing tradebook:', error);
    }
}

// Function to fetch and update positions
async function refreshPositions() {
    try {
        const response = await fetch('/positions');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newContent = tempDiv.querySelector('.table-container');
        if (newContent) {
            const currentContainer = document.querySelector('.table-container');
            if (currentContainer) {
                currentContainer.innerHTML = newContent.innerHTML;
            }
        }
    } catch (error) {
        console.error('Error refreshing positions:', error);
    }
}

// Function to fetch and update dashboard funds
async function refreshDashboard() {
    try {
        const response = await fetch('/dashboard');
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const newContent = tempDiv.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
        if (newContent) {
            const currentContainer = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
            if (currentContainer) {
                currentContainer.innerHTML = newContent.innerHTML;
            }
        }
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

// Function to fetch and update analyzer
async function refreshAnalyzer() {
    try {
        // Update stats
        const statsResponse = await fetch('/analyzer/stats');
        const statsData = await statsResponse.json();
        
        document.getElementById('total-requests').textContent = statsData.total_requests;
        document.getElementById('total-issues').textContent = statsData.issues.total;
        document.getElementById('unique-symbols').textContent = statsData.symbols.length;
        document.getElementById('active-sources').textContent = Object.keys(statsData.sources).length;

        // Update requests table
        const requestsResponse = await fetch('/analyzer/requests');
        const requestsData = await requestsResponse.json();
        const tbody = document.getElementById('requests-table');
        if (tbody && requestsData.requests) {
            tbody.innerHTML = requestsData.requests.map(request => `
                <tr class="hover:bg-base-200">
                    <td class="text-sm">${request.timestamp}</td>
                    <td><div class="badge badge-neutral">${request.source}</div></td>
                    <td class="font-medium">${request.symbol}</td>
                    <td>
                        <div class="badge ${getExchangeBadgeColor(request.exchange)}">
                            ${request.exchange}
                        </div>
                    </td>
                    <td>
                        <div class="badge ${request.action === 'BUY' ? 'badge-success' : 'badge-error'} gap-2">
                            ${request.action}
                        </div>
                    </td>
                    <td class="numeric-cell">${request.quantity}</td>
                    <td>
                        <div class="badge ${request.analysis.issues ? 'badge-warning' : 'badge-success'}">
                            ${request.analysis.issues ? 'Issues Found' : 'Valid'}
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" 
                                onclick='showDetails(${JSON.stringify(JSON.stringify(request))})'>
                            View
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error refreshing analyzer:', error);
    }
}

// Helper function to get exchange badge color
function getExchangeBadgeColor(exchange) {
    const colors = {
        'NSE': 'badge-accent',
        'BSE': 'badge-neutral',
        'NFO': 'badge-secondary',
        'MCX': 'badge-primary'
    };
    return colors[exchange] || 'badge-ghost';
}

// Make refreshCurrentPageContent available globally
window.refreshCurrentPageContent = function() {
    const path = window.location.pathname;
    if (path.includes('/logs')) {
        refreshLogs();
    } else if (path.includes('/orderbook')) {
        refreshOrderbook();
    } else if (path.includes('/tradebook')) {
        refreshTradebook();
    } else if (path.includes('/positions')) {
        refreshPositions();
    } else if (path === '/dashboard' || path === '/') {
        refreshDashboard();
    } else if (path.includes('/analyzer')) {
        refreshAnalyzer();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var alertSound = document.getElementById('alert-sound');

    socket.on('connect', function() {
        console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', function() {
        console.log('Disconnected from WebSocket server');
    });

    // Password change notification
    socket.on('password_change', function(data) {
        playAlertSound();
        showToast(data.message, 'info');
        refreshCurrentPageContent();
    });

    // Master contract download notification
    socket.on('master_contract_download', function(data) {
        playAlertSound();
        showToast(`Master Contract: ${data.message}`, 'info');
        refreshCurrentPageContent();
    });

    // Cancel order notification
    socket.on('cancel_order_event', function(data) {
        playAlertSound();
        showToast(`Cancel Order ID: ${data.orderid}`, 'warning');
        refreshCurrentPageContent();
    });

    // Modify order notification
    socket.on('modify_order_event', function(data) {
        playAlertSound();
        showToast(`ModifyOrder - Order ID: ${data.orderid}`, 'warning');
        refreshCurrentPageContent();
    });

    // Close position notification
    socket.on('close_position', function(data) {
        playAlertSound();
        showToast(`${data.message}`, 'info');
        refreshCurrentPageContent();
    });

    // Order placement notification
    socket.on('order_event', function(data) {
        playAlertSound();
        const type = data.action.toUpperCase() === 'BUY' ? 'success' : 'error';
        showToast(`${data.action.toUpperCase()} Order Placed for Symbol: ${data.symbol}, Order ID: ${data.orderid}`, type);
        refreshCurrentPageContent();
    });

    // Generic order notification handler
    socket.on('order_notification', function(data) {
        playAlertSound();
        
        // Determine notification type based on status
        let type = 'info';
        if (data.status && typeof data.status === 'string') {
            if (data.status.toLowerCase().includes('success')) {
                type = 'success';
            } else if (data.status.toLowerCase().includes('error') || data.status.toLowerCase().includes('reject')) {
                type = 'error';
            } else if (data.status.toLowerCase().includes('pending')) {
                type = 'warning';
            }
        }

        // Create notification message
        let message = '';
        if (data.symbol) {
            message += `${data.symbol}: `;
        }
        if (data.status) {
            message += data.status;
        }
        if (data.message) {
            message += data.message;
        }

        showToast(message, type);
        refreshCurrentPageContent();
    });

    // Analyzer update notification
    socket.on('analyzer_update', function(data) {
        playAlertSound();
        showToast(`API Request: ${data.request.symbol || 'Unknown'} - ${data.response.status}`, 
                 data.response.status === 'success' ? 'success' : 'warning');
        
        // Refresh analyzer content if on analyzer page
        if (window.location.pathname.includes('/analyzer')) {
            refreshAnalyzer();
        }
    });

    // Helper function to play alert sound
    function playAlertSound() {
        if (alertSound) {
            alertSound.play().catch(function(error) {
                console.log("Error playing sound:", error);
            });
        }
    }
});

// Functions for mobile menu toggle
function toggleMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    menu.classList.remove('-translate-x-full');
    document.querySelector('button[onclick="toggleMobileMenu()"]').style.display = 'none';
}

function closeMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    menu.classList.add('-translate-x-full');
    document.querySelector('button[onclick="toggleMobileMenu()"]').style.display = 'block';
}

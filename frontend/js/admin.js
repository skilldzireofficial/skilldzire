document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check - login kakunda వస్తే వెనక్కి పంపాలి
    const token = sessionStorage.getItem('admin_token');
    
    if (!token || token !== "skilldzire@4404") {
        window.location.href = "/admin-login";
        return;
    }
    fetchRequests();
});

// Logout function
function logout() {
    sessionStorage.removeItem('admin_token'); // clear session
    window.location.href = "/admin-login";
}

// Custom Modal Control
function showStatusModal(title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modal = document.getElementById('statusModal');
    
    if (modalTitle && modalMessage && modal) {
        modalTitle.innerText = title;
        modalMessage.innerText = message;
        modal.style.display = 'block';
    }
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
}

// 1. Load data from Backend
async function fetchRequests() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="loader">Fetching records...</td></tr>';

    try {
        // Render ki deploy chesinappudu URL marchali mava
        const response = await fetch('http://localhost:5000/api/admin/pending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': 'skilldzire@4404' 
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loader">No pending requests found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
    
        data.forEach(req => {
            const row = `
                <tr>
                    <td><b>${req.userName}</b></td>
                    <td>${req.course}</td>
                    <td>${req.userEmail}</td>
                    <td><code style="color: #FF6600; font-weight:bold;">${req.utrNumber || 'N/A'}</code></td>
                    <td><span class="badge">${req.status}</span></td>
                    <td class="action-btns">
                        <button class="btn-table approve" onclick="approveRequest('${req._id}', event)">Approve</button>
                        <button class="btn-table delete" onclick="deleteRequest('${req._id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (err) {
        console.error("Fetch error:", err);
        tbody.innerHTML = '<tr><td colspan="6" class="loader" style="color:red;">Failed to connect to server. Check Console!</td></tr>';
    }
}

// 2. Approve Request - FULL WORKING CODE WITH ERROR FIX
async function approveRequest(id, event) {
    if (!confirm("Please Confirm to approval")) return;

    const btn = event.target;
    const originalText = btn.innerText;

    try {
        btn.innerText = "Generating PDF...";
        btn.disabled = true;

        const response = await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': 'skilldzire@4404' 
            }
        });
        
        const result = await response.json();

        if(result.success) {
            showStatusModal("Success ✅", result.message || "Certificate ID Created & PDF Sent!");
            fetchRequests(); // List refresh chestundi
        } else {
            showStatusModal("Error ❌", result.message || "Approval process failed.");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error("Approve Request Error:", err);
        showStatusModal("Server Error", "Backend Connection Error.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// 3. Delete/Reject Request
async function deleteRequest(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-key': 'skilldzire@4404'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showStatusModal("Deleted", "The request record has been removed.");
            fetchRequests();
        } else {
            showStatusModal("Error", result.message || "Could not delete the record.");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showStatusModal("Server Error", "Failed to reach the server.");
    }
}

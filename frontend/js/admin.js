document.addEventListener('DOMContentLoaded', () => {
    fetchRequests();
});

// Custom Modal Control
function showStatusModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('statusModal').style.display = 'block';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

// 1. Load data from Backend
async function fetchRequests() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loader">Fetching records...</td></tr>';

    try {
        const response = await fetch('http://localhost:5000/api/admin/pending');
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
                    <td>${req.duration}</td>
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
        tbody.innerHTML = '<tr><td colspan="6" class="loader" style="color:red;">Failed to connect to server.</td></tr>';
    }
}

// 2. Approve Request
async function approveRequest(id, event) {
    if(!confirm("Do you want to approve and send the certificate email?")) return;

    try {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Sending...";
        btn.disabled = true;

        const response = await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
            method: 'POST'
        });
        const result = await response.json();

        if(result.success) {
            showStatusModal("Success", "Certificate has been generated and sent to the user successfully.");
            fetchRequests();
        } else {
            showStatusModal("Error", "Failed to process approval: " + result.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        showStatusModal("Server Error", "Something went wrong while connecting to the server.");
    }
}

// 3. Delete Request
async function deleteRequest(id) {
    if(!confirm("Are you sure you want to delete this record?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/reject/${id}`, {
            method: 'DELETE'
        });
        
        if(response.ok) {
            showStatusModal("Deleted", "The request record has been removed successfully.");
            fetchRequests();
        } else {
            showStatusModal("Error", "Could not delete the record from the database.");
        }
    } catch (err) {
        showStatusModal("Server Error", "Failed to reach the server.");
    }
}
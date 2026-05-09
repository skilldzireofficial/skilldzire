const API_URL = "https://skilldzire.onrender.com"; // Replace with your Render URL
const userId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', () => {
    if (!userId) {
        document.getElementById('loading').innerHTML = "<span style='color:red;'>Session Expired. Please Register.</span>";
        return;
    }
    fetchStatus();
});

async function fetchStatus() {
    try {
        const response = await fetch(`${API_URL}/status/${userId}`);
        const data = await response.json();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('statusTable').style.display = 'table';

        const tbody = document.getElementById('statusContent');
        const isPending = data.status === 'Pending';

       const isApproved = data.status === 'Approved';

        tbody.innerHTML = `
            <tr>
                <td>${data.name}</td>
                <td>${data.course}</td> <td>
                    <span class="${isApproved ? 'status-approved' : 'status-pending'}">
                        ${data.status} ${isApproved ? '✅' : ''}
                    </span>
                </td>
                <td>
                    ${isApproved ? 
                        `<span style="color:#4caf50; font-weight:600;">Verified ✅</span>` : 
                        `<button class="btn-edit" onclick="openEdit('${data.name}', '${data.course}')">Edit Details</button>`
                    }
                </td>
            </tr>
        `;
    } catch (err) {
        document.getElementById('loading').innerText = "Connection Error.";
    }
}

function openEdit(name) {
    document.getElementById('newName').value = name;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEdit() {
    document.getElementById('editModal').style.display = 'none';
}

async function submitEdit() {
    const name = document.getElementById('newName').value;
    const internship = document.getElementById('newCourse').value;

    const res = await fetch(`${API_URL}/update-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, internshipName: internship })
    });

    if (res.ok) {
        closeEdit();
        fetchStatus();
    } else {
        alert("Update failed. Please try again.");
    }
}
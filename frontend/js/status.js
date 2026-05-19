const API_URL = "https://skilldzire.onrender.com"; // Replace with your Render URL
const userEmail = localStorage.getItem('userEmail');

document.addEventListener('DOMContentLoaded', () => {
    if (!userEmail) {
        document.getElementById('loading').innerHTML = "<span style='color:red;'>Session Expired. Please Register.</span>";
        return;
    }
    fetchStatus();
});

async function fetchStatus() {
    try {
        const userEmail = localStorage.getItem('userEmail'); // main.js lo set chesam
        const response = await fetch(`${API_URL}/api/cert/status/${userEmail}`);
        const data = await response.json();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('statusTable').style.display = 'table';

        const tbody = document.getElementById('statusContent');
        const scrollText = document.getElementById('scrollText');
        const isApproved = data.status === 'Approved';

        // Approved ayithe scroll text marchu
        if (isApproved) {
            scrollText.innerHTML = `Approved Successfully <span style="color: rgb(26, 188, 26);">&#10004;</span>`;
            scrollText.style.color = 'rgb(26, 188, 26)';
            scrollText.style.background = 'rgba(198, 235, 198,0.5)';
            scrollText.style.border = '1px solid rgb(55, 210, 55)';
            scrollText.style.letterSpacing = '2px';
            scrollText.setAttribute('behavior', 'none'); 
        }

        tbody.innerHTML = `
            <tr>
                <td><b>${data.name}</b><br><small style="color:#aaa">${data.userEmail}</small></td>
                <td>${data.collegeName}<br><small style="color:#aaa">${data.branchRoll}</small></td>
                <td>${data.course}</td>
                <td>${data.duration}</td>
                <td>
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <span class="${isApproved ? 'status-approved' : 'status-pending-glossy'}">
                            ${data.status} ${isApproved ? '✅' : ''}
                        </span>
                        ${!isApproved ? 
                            `<button class="edit-icon-btn" title="Edit Details" onclick="openEdit('${data.userName}', '${data.course}')">✏️</button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    } catch (err) {
        document.getElementById('loading').innerHTML = "<span style='color:red;'>Record not found!</span>";
    }
}

function openEdit() {
    // sessionStorage lo munde unna details ni thechi form lo pettu
    const pendingData = JSON.parse(sessionStorage.getItem('pendingCertData'));
    
    if(pendingData) {
        document.getElementById('newName').value = pendingData.userName;
        document.getElementById('newCourse').value = pendingData.course;
        // Inka migatha fields (college, branch) modal lo unte avi kooda fill cheyochu
    }
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
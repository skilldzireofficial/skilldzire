// 1. Modal Control Logic
const modal = document.getElementById("certModal");

// Open Request Form
function openModal() {
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Disable background scrolling
}

// Close Request Form
function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Re-enable background scrolling
}

// 2. Form Submission & Payment Redirect
document.getElementById('certificateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect all data from form fields
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const collegeName = document.getElementById('collegeName').value;
    const branchRoll = document.getElementById('branchRoll').value;
    const course = document.getElementById('course').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    // Data check (Just in case)
    if(!userName || !userEmail || !course) {
        alert("Please fill all the details mava!");
        return;
    }

    // Create an object with user details
  const formData = {
        userName: userName,
        userEmail: userEmail,
        collegeName: collegeName,
        branchRoll: branchRoll,
        course: course,
        duration: `${fromDate} to ${toDate}`,
        startDate: fromDate, // Extra fields for certificate
        endDate: toDate
    };
    // Store this data in sessionStorage (Temporary browser memory)
    // Deenivalla payment page lo manam ee data ni vadochu
    sessionStorage.setItem('pendingCertData', JSON.stringify(formData));

    // Show a small loading state on button
    const payBtn = e.target.querySelector('.submit-btn');
    payBtn.innerText = "Redirecting to Payment...";
    payBtn.disabled = true;

    // Move to Payment Page
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 1000);
});

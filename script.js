const backendURL = 'https://script.google.com/macros/s/.../exec'; // Replace with your actual Apps Script URL

// Switch between sections
function showSection(sectionId, clickedLink) {
  event.preventDefault();

  const sections = document.getElementsByClassName('content-section');
  for (let section of sections) {
    section.style.display = 'none';
  }

  document.getElementById(sectionId).style.display = 'block';

  const navLinks = document.getElementsByClassName('nav-link');
  for (let link of navLinks) {
    link.classList.remove('active');
  }

  if (clickedLink) {
    clickedLink.classList.add('active');
  }

  if (sectionId === 'dnp') {
    loadDNPContent();
  } else if (sectionId === 'resources') {
    loadStaffResources();
  }
}

function loadDNPContent() {
  fetch(`${backendURL}?action=getDNPFileUrl`)
    .then(response => response.json())
    .then(data => {
      const dnpSection = document.getElementById('dnp');
      dnpSection.innerHTML = `
        <h2>Do Not Photograph (DNP) List</h2>
        <iframe src="https://drive.google.com/file/d/${data.id}/preview" style="width: 100%; height: 600px;"></iframe>
        <p>Last updated: ${data.lastUpdated}</p>
      `;
    })
    .catch(error => {
      console.error('Error loading DNP content:', error);
    });
}

function loadStaffResources() {
  fetch(`${backendURL}?action=getStaffResources`)
    .then(response => response.json())
    .then(data => {
      const resourcesSection = document.getElementById('resources');
      resourcesSection.innerHTML = `
        <h2>Staff Resources</h2>
        <p>Documents: ${JSON.stringify(data.documents)}</p>
        <p>Policies: ${JSON.stringify(data.policies)}</p>
      `;
    })
    .catch(error => {
      console.error('Error loading staff resources:', error);
    });
}

// Load the default section on page load
window.onload = function() {
  showSection('home');
};

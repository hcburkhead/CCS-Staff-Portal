/**
 * Replace with the full *EXEC* URL from your Apps Script deployment.
 * Example:
 *    'https://script.google.com/macros/s/AKfycbxminFR3sG75NaQ5lGj5.../exec'
 */
const backendURL =
  'YOUR_DEPLOYED_WEB_APP_URL';

/**
 * Switch between sections in the UI.
 */
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

  // Load dynamic content
  if (sectionId === 'dnp') {
    loadDNPContent();
  } else if (sectionId === 'resources') {
    loadStaffResources();
  }
}

/**
 * Load the DNP PDF info from the backend,
 * then embed the PDF (using Google Drive's preview URL).
 */
function loadDNPContent() {
  fetch(`${backendURL}?action=getDNPFileUrl`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      const dnpSection = document.getElementById('dnp');
      dnpSection.innerHTML = `
        <h2>Do Not Photograph (DNP) List</h2>
        <iframe
          src="https://drive.google.com/file/d/${data.id}/preview"
          style="width: 100%; height: 600px; border: none;"
        ></iframe>
        <p>Last updated: ${data.lastUpdated}</p>
      `;
    })
    .catch(error => {
      console.error('Error loading DNP content:', error);
      document.getElementById('dnp').innerHTML = `
        <p class="text-danger">Error: ${error.message}</p>
      `;
    });
}

/**
 * Load staff resources (documents & policies) from the backend.
 */
function loadStaffResources() {
  fetch(`${backendURL}?action=getStaffResources`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      const resourcesSection = document.getElementById('resources');
      resourcesSection.innerHTML = `
        <h2>Staff Resources</h2>
        <pre style="white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
      `;
      // You can customize how you display the documents/policies
      // by iterating over `data.documents` and `data.policies`.
    })
    .catch(error => {
      console.error('Error loading staff resources:', error);
      document.getElementById('resources').innerHTML = `
        <p class="text-danger">Error: ${error.message}</p>
      `;
    });
}

/**
 * Show the default section (Home) on page load.
 */
window.onload = function() {
  showSection('home');
};

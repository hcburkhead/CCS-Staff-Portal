// Drive configuration constants
const CONFIG = {
  // The ID of your Shared Drive (or 'root' if using My Drive).
  // Example: '0AGvS9V6x8O5RUk9PVA'
  sharedDriveId: 'YOUR_SHARED_DRIVE_ID',

  folders: {
    // ID of the folder containing your DNP PDFs
    dnp: 'FOLDER_ID_FOR_DNP',
    // ID of the folder containing staff documents
    staffDocs: 'FOLDER_ID_FOR_STAFF_DOCS',
    // ID of the folder containing staff policies
    staffPolicies: 'FOLDER_ID_FOR_STAFF_POLICIES'
  }
};

/**
 * Main entry point for GET requests to the web app.
 * We'll handle different actions by checking e.parameter.action.
 */
function doGet(e) {
  // OPTIONAL: If you ever need to handle preflight OPTIONS (CORS), you can do:
  // if (e.parameter.action === 'options') {
  //   return setCorsHeaders(ContentService.createTextOutput(''));
  // }

  const action = e.parameter.action;
  let responseData;

  try {
    if (action === 'getDNPFileUrl') {
      responseData = getDNPFileUrl();
    } else if (action === 'getStaffResources') {
      responseData = getStaffResources();
    } else {
      throw new Error('Invalid action parameter');
    }
  } catch (error) {
    console.error('Error handling request:', error);
    responseData = { error: error.message };
  }

  return setCorsHeaders(
    ContentService.createTextOutput(JSON.stringify(responseData))
  );
}

/**
 * Sets CORS headers so your GitHub Pages site can fetch data from here.
 * Adjust the domain/origin as needed.
 */
function setCorsHeaders(response) {
  return response
    .setMimeType(ContentService.MimeType.JSON)
    // IMPORTANT: Remove or adjust the slash at the end if needed:
    .setHeader('Access-Control-Allow-Origin', 'https://hcburkhead.github.io/CCS-Staff-Portal')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Returns info about the most recent DNP PDF (e.g., file ID, date).
 */
function getDNPFileUrl() {
  // Fetch files from the DNP folder
  const files = getFilesFromSharedFolder(CONFIG.folders.dnp);
  // Filter only PDF files
  const pdfFiles = files.filter(file => file.mimeType === 'application/pdf');

  if (pdfFiles.length === 0) {
    throw new Error('No PDF files found in DNP folder');
  }

  // For demonstration, just take the first PDF
  const file = pdfFiles[0];
  return {
    url: file.alternateLink,
    id: file.id,
    name: file.title,
    lastUpdated: new Date(file.modifiedDate).toDateString()
  };
}

/**
 * Returns staff resources, including documents and policies.
 */
function getStaffResources() {
  return {
    documents: getFolderContentsWithSubfolders(CONFIG.folders.staffDocs),
    policies: getFolderContentsWithSubfolders(CONFIG.folders.staffPolicies)
  };
}

/**
 * Fetches files from a shared folder using Advanced Drive Service.
 * Make sure the folder is in the same shared drive as specified in `CONFIG.sharedDriveId`.
 */
function getFilesFromSharedFolder(folderId) {
  const response = Drive.Files.list({
    q: `'${folderId}' in parents and trashed = false`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: 'drive',
    driveId: CONFIG.sharedDriveId,
    fields: 'items(id,title,mimeType,modifiedDate,alternateLink)'
  });

  // 'response.items' will be an array of file objects
  return response.items || [];
}

/**
 * Recursively returns folder contents (subfolders + files).
 */
function getFolderContentsWithSubfolders(folderId) {
  const items = getFilesFromSharedFolder(folderId);
  return items.map(item => {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      // It's a subfolder; get its contents recursively
      const subItems = getFilesFromSharedFolder(item.id);
      return {
        name: item.title,
        id: item.id,
        isFolder: true,
        lastUpdated: new Date(item.modifiedDate).toDateString(),
        contents: subItems.map(subItem => ({
          name: subItem.title,
          id: subItem.id,
          url: subItem.alternateLink,
          lastUpdated: new Date(subItem.modifiedDate).toDateString(),
          mimeType: subItem.mimeType
        }))
      };
    } else {
      // It's a file
      return {
        name: item.title,
        id: item.id,
        url: item.alternateLink,
        lastUpdated: new Date(item.modifiedDate).toDateString(),
        mimeType: item.mimeType,
        isFolder: false
      };
    }
  });
}

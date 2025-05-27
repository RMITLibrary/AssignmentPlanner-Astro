/**
 * URL parameter handling functions for Assignment Planner
 * Used to update URL with form data for sharing/bookmarking
 */

/**
 * Updates the URL with form parameters without refreshing the page
 *
 * @param {string} projectName - The name of the project/assignment type
 * @param {string} projectID - The ID of the project
 * @param {string} startDate - The start date (YYYY-MM-DD format)
 * @param {string} endDate - The end date (YYYY-MM-DD format)
 * @param {string} assignmentName - The optional name of the assignment
 * @param {boolean} isGroup - Whether this is a group assignment
 */
export const updateUrlWithFormData = (projectName, projectID, startDate, endDate, assignmentName, isGroup) => {
  try {
    // Create URL parameters object
    const params = new URLSearchParams();
    params.set('type', projectID);
    params.set('start', startDate);
    params.set('end', endDate);

    if (assignmentName) {
      params.set('name', assignmentName);
    }

    if (isGroup) {
      params.set('group', 'yes');
    }

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    console.log('URL updated with form parameters:', newUrl);
  } catch (error) {
    console.error('Error updating URL:', error);
  }
};

/**
 * Parses URL parameters to populate form data
 *
 * @returns {Object} An object containing form data from URL parameters
 */
export const getFormDataFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      typeParam: params.get('type'),
      startParam: params.get('start'),
      endParam: params.get('end'),
      nameParam: params.get('name'),
      groupParam: params.get('group')
    };
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return {
      typeParam: null,
      startParam: null,
      endParam: null,
      nameParam: null,
      groupParam: null
    };
  }
};

/**
 * Safely gets a specific parameter from the URL
 *
 * @param {string} paramName - The name of the parameter to retrieve
 * @returns {string|null} The parameter value or null if not found
 */
export const getUrlParameter = (paramName) => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
  } catch (error) {
    console.error(`Error getting URL parameter ${paramName}:`, error);
    return null;
  }
};

/**
 * Checks if URL has all required parameters for auto-submission
 *
 * @returns {boolean} True if all required parameters are present
 */
export const hasRequiredUrlParameters = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const startParam = params.get('start');
    const endParam = params.get('end');

    // Return true only if all required parameters are present
    return Boolean(typeParam && startParam && endParam);
  } catch (error) {
    console.error('Error checking URL parameters:', error);
    return false;
  }
};

/**
 * Creates a shareable link that can be copied
 *
 * @param {string} projectName - The name of the project/assignment type
 * @param {string} projectID - The ID of the project
 * @param {string} startDate - The start date (YYYY-MM-DD format)
 * @param {string} endDate - The end date (YYYY-MM-DD format)
 * @param {string} assignmentName - The optional name of the assignment
 * @param {boolean} isGroup - Whether this is a group assignment
 * @returns {string} The full shareable URL
 */
export const createShareableLink = (projectName, projectID, startDate, endDate, assignmentName, isGroup) => {
  try {
    // Create URL parameters object
    const params = new URLSearchParams();
    params.set('type', projectID);
    params.set('start', startDate);
    params.set('end', endDate);

    if (assignmentName) {
      params.set('name', assignmentName);
    }

    if (isGroup) {
      params.set('group', 'yes');
    }

    // Create the full URL
    const url = new URL(window.location.pathname, window.location.origin);
    url.search = params.toString();

    return url.toString();
  } catch (error) {
    console.error('Error creating shareable link:', error);
    return window.location.href;
  }
};

/**
 * Clears URL parameters
 */
export const clearUrlParameters = () => {
  try {
    window.history.pushState({}, '', window.location.pathname);
  } catch (error) {
    console.error('Error clearing URL parameters:', error);
  }
};

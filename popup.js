// Popup script to enable/disable cloud overlay

document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('toggleClouds');

    // Load current state
    chrome.storage.local.get({cloudsEnabled: true}, (data) => {
        checkbox.checked = data.cloudsEnabled;
    });

    // Toggle handler
    checkbox.addEventListener('change', () => {
        const enabled = checkbox.checked;
        chrome.storage.local.set({cloudsEnabled: enabled}, () => {
            // Reload current active tab so content script re-evaluates
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });
}); 
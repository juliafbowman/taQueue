// load the header at start of every page 
document.addEventListener('DOMContentLoaded', function() {
    // placeholder for header
    const headerPlaceholder = document.createElement('div');
    headerPlaceholder.id = 'header-placeholder';
    
    // put this at the start of the body 
    document.body.insertBefore(headerPlaceholder, document.body.firstChild);
    
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('problem header problem');
            }
            return response.text();
        })
        .then(data => {
            // put the header into placeholder 
            headerPlaceholder.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading header:', error);
            headerPlaceholder.innerHTML = '<p>Error loading header</p>';
        });
});
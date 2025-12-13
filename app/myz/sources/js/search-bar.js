document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('button[style*="float: right"]');
    
    function handleSearch() {
        const id = searchInput.value.trim();
        if (!id) return alert('请输入ID');
        
        if (id.startsWith('Z-')) {
            window.location.href = `./zwn.html?id=${id}`;
        } else if (id.startsWith('G-')) {
            window.location.href = `./zwc.html?id=${id}`;
        } else {
            alert('ID应以 Z- (作文) 或 G- (作文集) 开头');
        }
    }
    
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
});
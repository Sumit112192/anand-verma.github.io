// Search functionality for the website

class SearchManager {
    constructor() {
        this.searchData = {
            posts: [],
            projects: [],
            pages: []
        };
        this.searchIndex = new Map();
        this.isInitialized = false;

        this.init();
    }

    async init() {
        await this.loadSearchData();
        this.buildSearchIndex();
        this.setupSearchInterface();
        this.isInitialized = true;
    }

    async loadSearchData() {
        try {
            // Load blog posts
            const blogResponse = await fetch('blogs/metadata.json');
            if (blogResponse.ok) {
                const blogData = await blogResponse.json();
                this.searchData.posts = blogData.posts || [];
            }

            // Load projects
            const projectsResponse = await fetch('projects/projects-data.json');
            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                this.searchData.projects = projectsData.projects || [];
            }

            // Static pages data
            this.searchData.pages = [
                {
                    title: 'Home',
                    url: '/',
                    excerpt: 'Full Stack Developer and Tech Enthusiast. Explore projects and blog posts.',
                    type: 'page'
                },
                {
                    title: 'About',
                    url: 'about/',
                    excerpt: 'Learn about my background, skills, and professional journey.',
                    type: 'page'
                },
                {
                    title: 'Projects',
                    url: 'projects/',
                    excerpt: 'Showcase of web applications and development projects.',
                    type: 'page'
                },
                {
                    title: 'Blog',
                    url: 'blogs/',
                    excerpt: 'Thoughts on technology, programming, and industry trends.',
                    type: 'page'
                }
            ];

        } catch (error) {
            console.error('Error loading search data:', error);
        }
    }

    buildSearchIndex() {
        // Clear existing index
        this.searchIndex.clear();

        // Index blog posts
        this.searchData.posts.forEach(post => {
            const searchableText = `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase();
            this.addToIndex(searchableText, {
                ...post,
                type: 'blog',
                url: `blogs/post/?slug=${post.slug}`
            });
        });

        // Index projects
        this.searchData.projects.forEach(project => {
            const searchableText = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
            this.addToIndex(searchableText, {
                ...project,
                type: 'project',
                url: `projects/${project.slug}/`
            });
        });

        // Index pages
        this.searchData.pages.forEach(page => {
            const searchableText = `${page.title} ${page.excerpt}`.toLowerCase();
            this.addToIndex(searchableText, page);
        });
    }

    addToIndex(text, item) {
        const words = text.split(/\s+/).filter(word => word.length > 2);

        words.forEach(word => {
            if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, []);
            }
            this.searchIndex.get(word).push(item);
        });
    }

    setupSearchInterface() {
        // Setup search triggers
        this.setupSearchTriggers();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupSearchTriggers() {
        // Add search buttons/links
        const searchTriggers = document.querySelectorAll('[data-search-trigger]');
        searchTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSearch();
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });
    }

    openSearch() {
        if (!this.isInitialized) {
            console.warn('Search not initialized yet');
            return;
        }

        // Simple search implementation for static site
        const searchTerm = prompt('Search for posts, projects, or pages:');
        if (searchTerm) {
            this.performSearch(searchTerm);
        }
    }

    performSearch(query) {
        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
        const resultMap = new Map();

        searchTerms.forEach(term => {
            // Exact matches
            if (this.searchIndex.has(term)) {
                this.searchIndex.get(term).forEach(item => {
                    const key = `${item.type}-${item.title}`;
                    if (!resultMap.has(key)) {
                        resultMap.set(key, { ...item, score: 0 });
                    }
                    resultMap.get(key).score += 10; // Exact match gets high score
                });
            }

            // Partial matches
            for (const [indexTerm, items] of this.searchIndex) {
                if (indexTerm.includes(term) && indexTerm !== term) {
                    items.forEach(item => {
                        const key = `${item.type}-${item.title}`;
                        if (!resultMap.has(key)) {
                            resultMap.set(key, { ...item, score: 0 });
                        }
                        resultMap.get(key).score += 3; // Partial match gets lower score
                    });
                }
            }
        });

        // Convert to array and sort by score
        return Array.from(resultMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 results
    }

    displayResults(results, query) {
        if (results.length === 0) {
            alert(`No results found for "${query}"`);
            return;
        }

        const resultLinks = results.map(result => 
            `${result.title} (${result.type}): ${result.url}`
        ).join('\n');

        const selectedResult = prompt(`Found ${results.length} results for "${query}". Choose a number to visit:\n\n${resultLinks}\n\nEnter number (1-${results.length}):`);

        if (selectedResult) {
            const index = parseInt(selectedResult) - 1;
            if (index >= 0 && index < results.length) {
                window.location.href = results[index].url;
            }
        }
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SearchManager();
});

// Export for external use
window.SearchManager = SearchManager;

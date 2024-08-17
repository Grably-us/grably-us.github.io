<script>
    import SvelteMarkdown from 'svelte-markdown';
    
    export let htmlContent = '';
    
    // Improved function to extract Markdown from HTML
    function extractMarkdown(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return Array.from(doc.body.childNodes)
        .map(node => {
          if (node.nodeType === Node.TEXT_NODE) return node.textContent;
          if (node.tagName === 'BR') return '\n';
          if (node.tagName === 'P') {
            // Replace &nbsp; with space and handle other common HTML entities
            let content = node.innerHTML
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            return content + '\n\n';
          }
          return node.outerHTML;
        })
        .join('')
        .trim();
    }
  
    $: markdownContent = extractMarkdown(htmlContent);
  </script>
  
  <div class="markdown-body">
    <SvelteMarkdown source={markdownContent} />
  </div>
  
  <style>
    .markdown-body {
      font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      padding: 32px;
      background-color: #ffffff;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      box-shadow: inset 0 2px 6px 0 rgba(0, 0, 0, 0.1);
    }
  
    .markdown-body :global(h1) {
      padding-bottom: .3em;
      font-size: 2em;
      border-bottom: 1px solid #eaecef;
    }
  
    .markdown-body :global(h2) {
      padding-bottom: .3em;
      font-size: 1.5em;
      border-bottom: 1px solid #eaecef;
    }
  
    .markdown-body :global(p) {
      margin-bottom: 16px;
    }
  
    .markdown-body :global(ul), .markdown-body :global(ol) {
      padding-left: 2em;
      margin-bottom: 16px;
    }
  
    .markdown-body :global(li) {
      margin-bottom: 0.25em;
    }
  
    .markdown-body :global(code) {
      padding: .2em .4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27,31,35,.05);
      border-radius: 6px;
    }
  
    .markdown-body :global(pre) {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
  
    .markdown-body :global(strong) {
      font-weight: 600;
    }
  </style>
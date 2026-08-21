import re

def fix_paths(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace('href="/css/', 'href="./css/')
        content = content.replace('href="/portal"', 'href="./portal.html"')
        content = content.replace('src="/images/', 'src="./images/')
        content = content.replace('src="/js/', 'src="./js/')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

fix_paths('index.html')
fix_paths('portal.html')

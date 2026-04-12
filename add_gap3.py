with open('/Users/yesbolgansattar/Desktop/IBB/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.gap-2 { gap: 0.5rem; }', '.gap-2 { gap: 0.5rem; }\n.gap-3 { gap: 0.75rem; }')

with open('/Users/yesbolgansattar/Desktop/IBB/style.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")

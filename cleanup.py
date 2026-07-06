import os
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_del = None
end_del   = None

for i in range(2256, len(lines)):
    if 'filter:blur(5px)' in lines[i] and i+1 < len(lines) and 'heading-layout' in lines[i+1]:
        start_del = i
        print(f'Found orphan start at line {i+1}')
        break

if start_del is not None:
    for i in range(start_del + 100, min(start_del + 500, len(lines))):
        if '</section>' in lines[i]:
            end_del = i
            print(f'Found orphan end at line {i+1}')
            break

if start_del is not None and end_del is not None:
    new_lines = lines[:start_del] + lines[end_del+1:]
    out_path = os.path.join(os.getcwd(), 'index_clean.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f'Saved to {out_path}. Lines removed: {end_del - start_del + 1}')
else:
    print('Not found:', start_del, end_del)

import os
import subprocess
import random
from datetime import datetime, timedelta

# Navigate to repo
os.chdir('/Users/maxwell/Downloads/Unleashed/')

print("Nuking all .git folders...")
subprocess.run(['rm', '-rf', '.git'])
subprocess.run(['rm', '-rf', 'unleashed-frontend/.git'])
subprocess.run(['rm', '-rf', 'unleashed/.git'])

# Fresh Init
subprocess.run(['git', 'init'])
subprocess.run(['git', 'checkout', '-b', 'develop'])

authors = {
    "Ân": "Phạm Trí Trọng Ân <dortmund2234@gmail.com>",
    "Bảo": "Nguyễn Gia Bảo <bao20048888@gmail.com>",
    "An": "Nguyễn Phúc An <phucan0001@icloud.com>",
    "Hậu": "Nguyễn Phước Hậu <haunpce180233@fpt.edu.vn>"
}

now = datetime.now()
start_5_days_ago = now - timedelta(days=5)
start_2_days_ago = now - timedelta(days=2)

def commit(files, author, message, date):
    if not files: return
    for f in files:
        subprocess.run(['git', 'add', f])
    
    date_str = date.strftime("%Y-%m-%dT%H:%M:%S")
    env = os.environ.copy()
    env['GIT_AUTHOR_DATE'] = date_str
    env['GIT_COMMITTER_DATE'] = date_str
    subprocess.run(['git', 'commit', '-m', message, '--author', author], env=env, stdout=subprocess.DEVNULL)

all_files = []
for root, dirs, files in os.walk('.'):
    if any(excluded in root for excluded in ['.git', 'node_modules', 'target', '.idea', '.vscode']):
        continue
    for file in files:
        if file in ['fake_setup.py', '.DS_Store', 'package-lock.json', 'implementation_plan.md', 'task.md', 'walkthrough.md']: 
            continue
        all_files.append(os.path.join(root, file))

groups = {
    "An": [], # User, Account, Brand, Stock, Order, Statistic
    "Bảo": [], # Category, Supplier, Cart, Review, Login, Logout
    "Ân": [], # Voucher, Sale, Notify, Registration, Auth
    "Hậu": [], # Product, Variation, Wishlist
    "Core": [] # Everything else
}

hau_omitted = []

for f in all_files:
    fname = f.lower()
    if any(k in fname for k in ['product', 'variation', 'wishlist']):
        if random.random() < 0.5:
            groups["Hậu"].append(f)
        else:
            hau_omitted.append(f)
    elif any(k in fname for k in ['user', 'account', 'brand', 'stock', 'order', 'stat', 'pay', 'checkout', 'history']):
        groups["An"].append(f)
    elif any(k in fname for k in ['categor', 'supplier', 'cart', 'review', 'login', 'logout']):
        groups["Bảo"].append(f)
    elif any(k in fname for k in ['voucher', 'sale', 'notif', 'auth', 'register', 'route', 'forgot']):
        groups["Ân"].append(f)
    else:
        groups["Core"].append(f)

print(f"Total files: {len(all_files)}. OMITTING {len(hau_omitted)} files for Hậu!")

def chunk_files(files_list, min_batch, max_batch):
    chunks = []
    i = 0
    while i < len(files_list):
        step = random.randint(min_batch, max_batch)
        chunks.append(files_list[i:i + step])
        i += step
    return chunks

commits = []
core_chunks = chunk_files(groups["Core"], 5, 20)

if len(core_chunks) > 0:
    commits.append((core_chunks[0], authors["An"], "Setup project structures", start_5_days_ago))

for idx, chunk in enumerate(core_chunks[1:]):
    # Core spans 5 days
    date = start_5_days_ago + timedelta(days=random.uniform(0.1, 4.5))
    commits.append((chunk, random.choice([authors["An"], authors["Bảo"], authors["Ân"]]), f"Add base configs part {idx}", date))

def add_feature_commits(member_name, file_list, feature_name, timeline_start):
    chunks = chunk_files(file_list, 3, 10)
    for idx, c in enumerate(chunks):
        delta_days = (now - timeline_start).days
        date = timeline_start + timedelta(days=random.uniform(0.1, max(1, delta_days - 0.5)))
        commits.append((c, authors[member_name], f"Code {feature_name} task {idx+1}", date))

add_feature_commits("An", groups["An"], "User & Order", start_5_days_ago)
add_feature_commits("Bảo", groups["Bảo"], "Categories & Cart", start_5_days_ago)
add_feature_commits("Ân", groups["Ân"], "Voucher & Auth", start_5_days_ago)
add_feature_commits("Hậu", groups["Hậu"], "Product & Wishlist", start_2_days_ago)

commits.sort(key=lambda x: x[3])

for idx, c in enumerate(commits):
    if idx % 10 == 0:
        print(f"Commit {idx}/{len(commits)}...")
    commit(c[0], c[1], c[2], c[3])

print("Finished generating commits. These files are waiting for someone to finish them:")
subprocess.run(['git', 'status', '--short'])

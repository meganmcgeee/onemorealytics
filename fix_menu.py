import glob
import re

files = glob.glob("public/*.html")
count = 0

# Adjusted regex to handle single/double quotes and extra spaces
pattern = re.compile(r"<script>\s*document\.getElementById\(['\"]mobile-menu-btn['\"]\)\.addEventListener\('click',\s*function\(\)\s*\{\s*const menu = document\.getElementById\(['\"]mobile-menu['\"]\);\s*menu\.classList\.toggle\(['\"]hidden['\"]\);\s*\}\);\s*</script>", re.DOTALL)

for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    if pattern.search(content):
        content = pattern.sub("", content)
        with open(f, "w") as file:
            file.write(content)
        count += 1

print(f"Removed interfering inline script from {count} files.")

import subprocess
import sys
import os

def run_command(command, cwd=None):
    """Runs a shell command and handles errors."""
    print(f"Running: {command} in {cwd if cwd else 'current directory'}...")
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing {command}: {e}")
        return False

def main():
    print("=== Traffic Automation Pro: Dependency Installer ===\n")

    # 1. Check for Node.js
    try:
        subprocess.run("node --version", shell=True, check=True, capture_output=True)
    except:
        print("Error: Node.js is not installed. Please install Node.js first.")
        sys.exit(1)

    # 2. Install Root Dependencies
    print("--- Installing Backend Dependencies ---")
    if not run_command("npm install"):
        sys.exit(1)

    # 3. Install Frontend Dependencies
    print("\n--- Installing Frontend Dependencies ---")
    frontend_path = os.path.join(os.getcwd(), "frontend")
    if os.path.exists(frontend_path):
        if not run_command("npm install", cwd=frontend_path):
            sys.exit(1)
    else:
        print("Warning: 'frontend' directory not found.")

    # 4. Install Playwright Browsers
    print("\n--- Installing Playwright Browsers ---")
    if not run_command("npx playwright install chromium"):
        sys.exit(1)

    print("\n✅ All dependencies installed successfully!")
    print("To start the project, run: npm run dev")

if __name__ == "__main__":
    main()

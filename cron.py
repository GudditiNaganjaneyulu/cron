import requests
import os  # Import the os module to access environment variables
from datetime import datetime

# Get the website URL from the environment variable
TARGET_URL = os.getenv("WEBSITE_URL", "https://default.com")  # Default value if the env var is not set

# Function to check website uptime
def check_website_uptime():
    current_time = datetime.now()
    print(f"Checking website uptime at {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
    try:
        # Send a request to the website
        response = requests.get(TARGET_URL)
        
        # Check the status code of the response
        if response.status_code == 200:
            print(f"Website is up (Status Code: {response.status_code})")
        else:
            print(f"Website might be down (Status Code: {response.status_code})")
    except requests.RequestException as e:
        print(f"Error with request: {e}")

# Run the uptime check once
check_website_uptime()

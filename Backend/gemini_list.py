


import requests

API_KEY = "AIzaSyCrB78zL3Rjm_SOLr_5CtoF9BN8jwYv9ZI"
response = requests.get(
    f"https://generativelanguage.googleapis.com/v1/models?key={API_KEY}"
)
print(response.json())

import requests
import json

API_URL = "http://localhost:8000/api/generate-json"

# Example 1: C++ Reverse Array Code
code_example = """#include <iostream>
#include <vector>
using namespace std;

void reverseArray(vector<int> &arr) {
    int n = arr.size();
    vector<int> temp(n);
    
    for(int i = 0; i < n; i++)
        temp[i] = arr[n - i - 1];
    
    for(int i = 0; i < n; i++)
        arr[i] = temp[i];
}

int main() {
    vector<int> arr = { 1, 4, 3, 2, 6, 5 };
    reverseArray(arr);
    
    for(int i = 0; i < arr.size(); i++) 
        cout << arr[i] << " ";
    return 0;
}"""

# Example 2: DSA Question
question_example = """
Merge Two Sorted Arrays: Given two sorted arrays nums1 and nums2, merge them into a single sorted array.
Use the two-pointer technique to solve this efficiently.
"""

def test_code_visualization():
    """Test with raw code"""
    print("=" * 80)
    print("TEST 1: Code Visualization (C++ Reverse Array)")
    print("=" * 80)
    
    payload = {
        "content": code_example,
        "sampleInput": json.dumps([1, 4, 3, 2, 6, 5]),
        "sampleOutput": json.dumps([5, 6, 2, 3, 4, 1])
    }
    
    response = requests.post(API_URL, data=payload)
    result = response.json()
    
    if result["success"]:
        print("✅ SUCCESS!")
        print(f"Generated {len(result['json_data'].get('steps', []))} steps")
        print("\nFirst step description:")
        if result['json_data'].get('steps'):
            print(result['json_data']['steps'][0].get('description', 'N/A'))
        
        # Save to file
        with open("visualization_output.json", "w") as f:
            json.dump(result['json_data'], f, indent=2)
        print("\n📁 Full output saved to: visualization_output.json")
    else:
        print("❌ FAILED!")
        print(f"Error: {result['error']}")

def test_question_visualization():
    """Test with DSA question"""
    print("\n" + "=" * 80)
    print("TEST 2: Question Visualization (Merge Sorted Arrays)")
    print("=" * 80)
    
    payload = {
        "content": question_example,
        "sampleInput": json.dumps({
            "nums1": [1, 4, 5, 9, 12, 15],
            "nums2": [2, 3, 6, 10, 11, 14]
        }),
        "sampleOutput": json.dumps([1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 14, 15])
    }
    
    response = requests.post(API_URL, data=payload)
    result = response.json()
    
    if result["success"]:
        print("✅ SUCCESS!")
        print(f"Generated {len(result['json_data'].get('steps', []))} steps")
        print("\nMeta information:")
        meta = result['json_data'].get('meta', {})
        print(f"  Title: {meta.get('title', 'N/A')}")
        print(f"  Type: {meta.get('type', 'N/A')}")
        print(f"  Time Complexity: {meta.get('complexity', {}).get('time', 'N/A')}")
        
        # Save to file
        with open("visualization_question.json", "w") as f:
            json.dump(result['json_data'], f, indent=2)
        print("\n📁 Full output saved to: visualization_question.json")
    else:
        print("❌ FAILED!")
        print(f"Error: {result['error']}")

if __name__ == "__main__":
    print("\n🚀 Testing Algorithm Visualization API\n")
    
    # Check health
    health = requests.get("http://localhost:8000/api/health").json()
    print(f"API Status: {health.get('status', 'unknown')}")
    print(f"Ollama: {health.get('ollama', 'unknown')}")
    print(f"Model: {health.get('model', 'unknown')}\n")
    
    if health.get('status') != 'healthy':
        print("⚠️  Warning: API or Ollama not healthy!")
        print("Make sure Ollama is running: ollama serve\n")
    
    # Run tests
    try:
        test_code_visualization()
        test_question_visualization()
        print("\n✅ All tests completed!")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
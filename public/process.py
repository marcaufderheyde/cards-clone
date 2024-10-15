import json
import re

def update_blanks_in_json(file_path):
    try:
        # Open and read the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Update the "blanks" property based on the count of '_____'
        for card in data:
            blank_count = len(re.findall(r'_____', card['text']))
            card['blanks'] = blank_count

        # Write the updated data back to the JSON file
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2)

        print("The file has been successfully updated.")

    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
    except json.JSONDecodeError:
        print("Error: Could not decode the JSON file.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
file_path = 'black.json'
update_blanks_in_json(file_path)

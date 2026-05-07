import email
from email import policy
from html.parser import HTMLParser
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs= True
        self.text = []
    def handle_data(self, d):
        self.text.append(d)
    def get_data(self):
        return '\n'.join(self.text)

def extract_text(mhtml_path):
    try:
        with open(mhtml_path, 'rb') as f:
            msg = email.message_from_binary_file(f, policy=policy.default)
        
        html_content = ""
        for part in msg.walk():
            if part.get_content_type() == 'text/html':
                html_content = part.get_payload(decode=True).decode(part.get_content_charset('utf-8'), errors='ignore')
                break
                
        if html_content:
            s = MLStripper()
            s.feed(html_content)
            text = s.get_data()
            
            # Clean up empty lines
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            for line in lines:
                print(line)
        else:
            print("No HTML content found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text(sys.argv[1])

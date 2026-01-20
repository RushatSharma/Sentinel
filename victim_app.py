from flask import Flask, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def login():
    # HTML with form action set to "/" so it posts to this same page
    html_content = """
    <html>
        <body>
            <h2>Vulnerable Bank Login</h2>
            <form action="/" method="POST">
                Username: <input type="text" name="username"><br>
                Password: <input type="password" name="password"><br>
                <input type="submit" value="Login">
            </form>
        </body>
    </html>
    """
    
    if request.method == 'POST':
        username = request.form.get('username', '')
        
        # This simulates a broken database that crashes on quotes
        if "'" in username or '"' in username:
            return "FATAL ERROR: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version."
        return "Login Failed"

    return html_content

if __name__ == '__main__':
    print("Victim Server running on port 5000...")
    app.run(port=5000)
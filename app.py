import mysql.connector
from flask import request, redirect, session
from flask import Flask, render_template, request, jsonify

# ✅ ADD THIS (VERY IMPORTANT)
app = Flask(__name__)
app.secret_key = "secret123"
users = {}
# ✅ DB CONNECTION
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root123",
        database="suraksha_safar"
    )
    print("✅ MySQL Connected Successfully")
except Exception as e:
    print("❌ Error:", e)
SAFETY_DATA = {
    'mumbai': {
        'score': 87,
        'risk': 'Low',
        'ai_recommendation': 'Mumbai is widely considered safe for women solo travelers. Local trains are crowded but safe; ladies compartments are available. Avoid isolated areas in late hours.',
        'day_safety': 'Highly Safe',
        'night_safety': 'Generally Safe',
        'safe_routes': ['Marine Drive', 'Linking Road, Bandra', 'Colaba Causeway'],
        'unsafe_areas': ['Isolated parts of Aarey Colony night time', 'Empty train compartments past midnight'],
        'nearby_places': [
            {'name': 'Marine Drive Police Station', 'type': 'Police', 'distance': '0.5 km'},
            {'name': 'Lilavati Hospital', 'type': 'Hospital', 'distance': '2.1 km'}
        ],
        'verified_transport': [
            {'name': 'SafeWomen Cabs', 'desc': 'Verified female drivers only'}
        ],
        'accommodations': [
            {'name': 'StaySafe Women Hostel', 'desc': '24/7 Security & CCTV', 'location': 'Andheri West'}
        ]
    },
    'delhi': {
        'score': 55,
        'risk': 'High',
        'ai_recommendation': 'Exercise caution, particularly after sunset. Stick to well-lit areas and use trusted ride-hailing apps or the Metro. Avoid public buses at night.',
        'day_safety': 'Moderate',
        'night_safety': 'High Risk',
        'safe_routes': ['Connaught Place Inner Circle', 'Hauz Khas Village (Main Street)', 'Delhi Metro (Day)'],
        'unsafe_areas': ['Ridge Road', 'Outer Ring Road (unlit stretches)', 'Seelampur late night'],
        'nearby_places': [
            {'name': 'Connaught Place Police Station', 'type': 'Police', 'distance': '1.2 km'},
            {'name': 'AIIMS Hospital', 'type': 'Hospital', 'distance': '4.5 km'}
        ],
        'verified_transport': [
            {'name': 'BluSmart EVs', 'desc': 'GPS Tracked, Secure Rides'}
        ],
        'accommodations': [
            {'name': 'SecureStay PG for Ladies', 'desc': 'Biometric Entry', 'location': 'South Extension'}
        ]
    },
    'bangalore': {
        'score': 74,
        'risk': 'Moderate',
        'ai_recommendation': 'Tech parks and commercial zones are safe. Ensure your cab is GPS-tracked during late-night commutes from office zones.',
        'day_safety': 'Safe',
        'night_safety': 'Moderate',
        'safe_routes': ['Indiranagar 100ft Road', 'MG Road', 'Koramangala 80ft Road'],
        'unsafe_areas': ['Outer Ring Road underpasses late night', 'Isolated layouts in Electronic City'],
        'nearby_places': [
            {'name': 'Indiranagar Police Station', 'type': 'Police', 'distance': '0.8 km'},
            {'name': 'Manipal Hospital', 'type': 'Hospital', 'distance': '3.2 km'}
        ],
        'verified_transport': [
            {'name': 'GoPink Cabs', 'desc': 'Women-exclusive cab service'}
        ],
        'accommodations': [
            {'name': 'Working Women Hostel BN', 'desc': 'Female guards, Safe access', 'location': 'Koramangala'}
        ]
    }
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_city():
    data = request.get_json()
    city = data.get('city', '').lower()
    
    if city in SAFETY_DATA:
        return jsonify({'success': True, 'data': SAFETY_DATA[city]})
    else:
        return jsonify({'success': False, 'message': 'City data not available'})
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if username in users and users[username] == password:
            session['user'] = username
            return redirect('/')
        else:
            return "Invalid Login"

    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        users[username] = password
        return redirect('/login')

    return render_template('register.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')
@app.route('/sos', methods=['POST'])
def trigger_sos():
    cursor = db.cursor()

    query = "INSERT INTO sos_alerts (timestamp) VALUES (NOW())"
    cursor.execute(query)

    db.commit()

    return jsonify({
        'success': True,
        'message': 'SOS Stored in Database!'
    })
if __name__ == '__main__':
    app.run(debug=True, port=5000)
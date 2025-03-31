import os
import logging
from flask import Flask, render_template

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

@app.route('/')
def index():
    """Render the homepage"""
    # Mock data for contestants
    contestants = [
        {
            "id": 1,
            "name": "Adebola Johnson", 
            "age": 25,
            "location": "Lagos",
            "bio": "Content creator and aspiring actor with a passion for storytelling.",
            "votes": 245,
            "image_url": "https://images.unsplash.com/photo-1522327646852-4e28586a40dd"
        },
        {
            "id": 2,
            "name": "Chioma Okafor",
            "age": 23,
            "location": "Abuja",
            "bio": "Fashion designer and lifestyle vlogger sharing Nigerian culture.",
            "votes": 312,
            "image_url": "https://images.unsplash.com/photo-1659540517934-cba43fc64ded"
        },
        {
            "id": 3,
            "name": "Emeka Nwosu",
            "age": 28,
            "location": "Port Harcourt",
            "bio": "Music producer who loves to create fusion of afrobeats and jazz.",
            "votes": 189,
            "image_url": "https://images.unsplash.com/photo-1589707181684-24a34853641d"
        },
        {
            "id": 4,
            "name": "Folake Ade",
            "age": 24,
            "location": "Ibadan",
            "bio": "Dancer and choreographer with unique Afro-contemporary moves.",
            "votes": 278,
            "image_url": "https://images.unsplash.com/photo-1659540517163-e9a29f4d1251"
        },
        {
            "id": 5,
            "name": "Tunde Bakare",
            "age": 26,
            "location": "Kano",
            "bio": "Tech enthusiast and gaming streamer building a Nigerian gaming community.",
            "votes": 201,
            "image_url": "https://images.unsplash.com/photo-1495434942214-9b525bba74e9"
        },
        {
            "id": 6,
            "name": "Ngozi Eze",
            "age": 22,
            "location": "Enugu",
            "bio": "Makeup artist and beauty influencer creating unique Nigerian looks.",
            "votes": 267,
            "image_url": "https://images.unsplash.com/photo-1523365280197-f1783db9fe62"
        },
        {
            "id": 7,
            "name": "Ibrahim Yusuf",
            "age": 27,
            "location": "Kaduna",
            "bio": "Stand-up comedian bringing laughter and social commentary.",
            "votes": 234,
            "image_url": "https://images.unsplash.com/photo-1528820184586-dd0d858b7254"
        },
        {
            "id": 8,
            "name": "Amara Obi",
            "age": 25,
            "location": "Owerri",
            "bio": "Culinary enthusiast showcasing modern Nigerian cuisine.",
            "votes": 156,
            "image_url": "https://images.unsplash.com/photo-1632215861513-130b66fe97f4"
        },
        {
            "id": 9,
            "name": "Dayo Adeleke",
            "age": 29,
            "location": "Abeokuta",
            "bio": "Fitness trainer promoting healthy living with African exercises.",
            "votes": 198,
            "image_url": "https://images.unsplash.com/photo-1543234723-b70b104d8e25"
        },
        {
            "id": 10,
            "name": "Fatima Bello",
            "age": 24,
            "location": "Sokoto",
            "bio": "Traditional storyteller bringing Nigerian folklore to modern audiences.",
            "votes": 222,
            "image_url": "https://images.unsplash.com/photo-1539414785349-55cfff23f5b9"
        }
    ]

    daily_tasks = [
        "Create a 3-minute comedy sketch",
        "Perform a Nigerian song cover",
        "Recreate a viral TikTok challenge",
        "Cook a traditional Nigerian dish",
        "Share your life story in 2 minutes",
        "Perform a talent unique to you",
        "Create content with another contestant"
    ]

    current_day = 3  # Example: Day 3 of the 7-day competition

    return render_template('index.html', contestants=contestants, daily_tasks=daily_tasks, current_day=current_day)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

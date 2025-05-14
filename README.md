# CS 546: GitMatches

***Connecting developers, building projects.***

## 📌 Overview

**GitMatches** is a platform designed to help developers collaborate on open-source projects by intelligently matching them based on GitHub activity, skills, and experience as well as their resume data. Whether you're looking to join a project, find contributors for your own, or grow your network of fellow programmers, GitMatches makes it easier than ever to build meaningful connections in the dev community.

## Setup
### General Dependencies
Please have `nodejs` and `npm` installed. 
Once you have the code of the project ready, install the nodejs dependencies with `npm i`

### Platform-spesific Dependencies
If you are using MacOS or Linux, you will need to install poppler before running this project.
You can install this with the following command(s) depending on your platform:
- Linux (Ubuntu/Debian): `sudo apt-get install poppler-data poppler-utils`
- MacOS (Homebrew): `brew install poppler`

## Seeding the database
This will allow you to populate your database with realistic data to emulate real-world use of this website.
Once your mongodb database is up and running, create a database with the name `CS546_Group1_gitMatches` and initial collection `users`.
After this is done, you can run `npm run seed`, which will populate the database.

## Running the project
Once all of the project dependencies are set up (and mongodb is running), you can start the project with `npm start`

## 🚀 Key Features

- **🔍 GitHub & Resume Matching:**  
  Scan your GitHub profile and resume to generate personalized tags, such as your most-used programming languages and tools.

- **🧠 Smart Project Recommendations:**  
  Get matched with projects based on your skills, tags, and experience.

- **📄 Project Posts Page:**  
  Browse open-source projects, see detailed descriptions, and request to join.

- **👥 Profile Pages:**  
  Show off your projects, GitHub highlights, skills, and earned achievements.

- **🤝 Collaborator Requests:**  
  Send join requests to project owners—just like LinkedIn connect requests—and get notified when accepted or rejected.

- **📨 Friend System:**  
  Add friends and build a professional network of coders and collaborators.

- **🏆 Achievements:**  
  Unlock badges for milestones like number of joined projects or friends added.

- **🔔 Notifications Page:**  
  Keep track of join requests, post activity, and social updates.

## ✨ Planned Extra Features

- **💬 Direct Messaging:**  
  Chat directly with your collaborators and friends.

- **📢 Social Feed:**  
  Post updates, share wins, and engage with your network.

- **🧠 Integrating Kaggle Data**
  Pull more data for stronger skill typing on profiles.

## 💡 Tech Stack

- **Frontend:** HTML/CSS, JavaScript, Handlebars.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **APIs:** GitHub REST API  
- **Others:** Custom Resume Parser (for skill extraction)

## 👩‍💻 Team GitMatches

- Nelson Bermeo  
- Anna Hauk  
- Benicio Hernandez  
- Christopher Kalish  
- Zakariyya Scavotto

🔗 [GitHub Repository](https://github.com/annahauk/cs-546)

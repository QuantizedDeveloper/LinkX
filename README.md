# neuraGigs

neuraGigs is a freelancer marketplace built for agencies and businesses that regularly hire freelancers.

Instead of searching through freelancer profiles manually, businesses can describe what they need to LinkBot. LinkBot asks a few questions about the project and helps find matching freelancers on LinkX.

## Features

* Freelancer profiles and portfolios
* Freelancer project listings
* LinkBot for finding relevant freelancers
* Skill and project-based matching
* Verified freelancer profiles
* Messaging between users
* Real-time message notifications
* Freelancer and client accounts
* Responsive web interface

## How LinkBot Works

1. Describe the work you need.
2. LinkBot asks questions to understand the requirements.
3. Your answers are used to find relevant freelancers.
4. Review the matching freelancers and their profiles.
5. Contact them through LinkX.

LinkBot is intended to reduce the time spent manually searching through freelancer profiles.

## Tech Stack

### Frontend

* React.js
* JavaScript
* HTML
* CSS

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT

### Database

* PostgreSQL
* Supabase

### Other Services

* Hugging Face — backend hosting
* Cloudinary — media and image storage
* Ably — real-time messaging
* Web Push — browser notifications
* Gemini — LinkBot's conversational responses

## Project Structure

```text
neuraGigs/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
├── package.json
└── README.md
```

The backend is maintained separately from this frontend repository.

## Running Locally

### Requirements

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/QuantizedDeveloper/LinkX.git
cd LinkX
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application will normally be available at:

```text
http://localhost:3000
```

### Production Build

Create a production build with:

```bash
npm run build
```

The production files are generated in the `build` directory.

## Deployment

The frontend can be deployed as a static React application.

The neuraGigs production frontend is available at:

https://linkxllm.run.place

## Status

neuraGigs is under active development.

The core marketplace, freelancer profiles, matching, messaging, and notification functionality are being developed and tested as the product evolves.

## Repository

GitHub:

https://github.com/QuantizedDeveloper/LinkX

## License

This project does not currently use an open-source license.

```

This version deliberately keeps the README **technical and factual** rather than trying to sell the project. If you want it even more stripped down, I can make it look like a serious **developer-built open-source README** with almost no marketing language.
```
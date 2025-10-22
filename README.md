# 📊 Budget Tracker – Personal Finance Analytics Dashboard

A full-stack financial analytics platform built for the DotProduct assessment.
The project enables users to record income/expenses, categorize transactions, and visualize financial insights interactively using D3.js.

- Deployed URL:- https://budget-tracker-frontend-brown.vercel.app/
- Browsable API Page:- https://budget-tracker-backend-1m7f.onrender.com/api-docs/
- Demo account email:- test@example.com
- Demo account password:- password

---

## 🚀 Tech Stack

### Frontend
- React.js (Vite) – UI framework
- D3.js – Data-driven visualizations for category & monthly analytics
- TailwindCSS – Styling and layout
- Redux toolkit to store all categories globally
- DataGrid – Displaying api data
- Axios – API communication
- React Router DOM – Routing

### Backend

- Node.js + Express.js – RESTful API framework
- MongoDB + Mongoose – Database & ORM
- Joi – Schema validation
- swagger-ui-express - For creating browsable API page

---

## 📂 Features

- User authentication (login/register)
- For user registration, directly hit endpoint with POST request "/user/register" with body: name, email and password (all required)
- Add, edit, and delete transactions
- Transactions sorting by type, amount and date supported by using query params **sortBy** and **sortDir** along with pagination by infinite scrolling by using **skip** **limit** query params
- Transactions filtering by **type**, **category**, **minAmount**, **maxAmount**, **startDate** and **endDate**
- Create and manage categories (income/expense)
- Responsive UI and dynamic data loading
- Modular folder structure (backend: MVC, frontend: component-based)

### Analytics dashboard (used D3.js):
- Income vs Spent vs Balance
- Total income vs expense by category
- Monthly trend visualization

---

## 🧠 Reasonable Assumptions Made

- Each user can only access their own transactions and categories.
- Data visualization focuses on aggregated monthly and category-wise summaries.
- Transactions are created with a single user, category, and type (income | expense).
- Authentication is simplified for demonstration (JWT/local storage used).

---

## 🌐 Hosted Links

| Platform                                 | URL                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Frontend (Vercel)**                    | [https://budget-tracker-frontend-brown.vercel.app/](https://budget-tracker-frontend-brown.vercel.app/)                  |
| **Backend / Swagger Browsable API (Render)** | [https://budget-tracker-backend-1m7f.onrender.com/api-docs/](https://budget-tracker-backend-1m7f.onrender.com/api-docs/)    |

---

## 🔐 Credentials for Review

| Role     | Email                                                     | Password           |
| -------- | --------------------------------------------------------- | ------------------ |
| Reviewer | [test@example.com](mailto:test@example.com)               | **password** |

---

## ⚙️ Local Setup

# Clone repository
```bash
git clone https://github.com/SahO-ux/budget-tracker.git
```

### Environment Variables

- Create .env in both backend & frontend with:

# Backend
```bash
PORT=8081
MONGODB_URL=<your_mongodb_atlas_url>
JWT_SECRET=<any_string>
SWAGGER_SERVER_URL=http://localhost:8081
```

### Frontend
```bash
VITE_API_URL="http://localhost:8081"
```
- From root folder(budget-tracker), run the following:-

# Backend setup
```bash
cd backend
npm install
npm run dev
```

# Frontend setup
```bash
cd frontend
npm install
npm run dev
```

---
## 📂 Folder Structure

```
budget-tracker/
│
├── backend/
│   ├── index.js
│   ├── mongoDB/
│   ├── server/
│         ├── lib/
│         ├── middleware/
│         ├── modules/
│         ├── modules-loader.js
│         ├── swagger.js
│   └── .env
│   └── .gitignore
│   └── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── public/
│   │   ├── src/
│   │        ├── api/
│   │        ├── components/
│   │        ├── modules/
│   │        ├── Pages/
│   │        ├── store/
│   │        ├── utils
│   │        └── App.jsx
│   │        └── AuthContext.jsx
│   │        └── index.css
│   │        └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   └── vite.config.js
│   └── postcss.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🧩 Acknowledgements

- The following open-source libraries and tools were used and are gratefully acknowledged:

- D3.js for data visualization
- DataGrid for displaying data in table
- Redux toolkit to store categories globally
- swagger-ui-express - For creating browsable API page
- Axios for REST communication
- TailwindCSS for styling
- Framer motion for intuitive card interactions
- Moment.js for displaying dates across app
- React Bootstrap for implemnting modals across frontend
- React.js for UI development
- Express.js for backend API
- MongoDB for database
- Render & Vercel for free hosting

---

## 📧 Contact

- Developer: Sahil Akbari
- Email: sahilakbari1111@gmail.com
- Phone: +91 7041849886
- Submission For: DotProduct Full-Stack Developer Assessment

---

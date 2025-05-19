# To do app

A simple task management board that allows users to organize tasks by dragging and dropping them between different status columns (To Do, In Progress, Done).

## 🚀 Features

- ✅ View tasks organized in columns
- ✅ Create new tasks
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Drag and drop tasks between columns
- ✅ Persistent state changes
- ✅ Real-time UI updates
- ✅ Error handling and loading states

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- react-beautiful-dnd for drag and drop
- Axios for API communication
- Lucide React for icons

**Backend:**
- FastAPI (Python)
- JSON file for data persistence
- Pydantic for data validation
- CORS middleware for frontend integration


## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy the sample backend/task.json to backend/task.json

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🔗 API Endpoints

### Tasks API

- `GET /tasks` - Get all tasks from all columns
- `GET /tasks/{column_id}` - Get tasks from a specific column
- `POST /tasks/{column_id}` - Create a new task in a column
- `PUT /tasks/{task_id}` - Update an existing task
- `DELETE /tasks/{task_id}` - Delete a task
- `POST /tasks/move` - Move a task between columns

### Health Check

- `GET /health` - Health check endpoint

## 📝 Usage

1. **Creating Tasks**: Click the "Add Task" button in any column to create a new task with a title and description.

2. **Editing Tasks**: Click the edit icon on any task card to modify its title and description.

3. **Deleting Tasks**: Click the delete icon on any task card to remove it (with confirmation).

4. **Moving Tasks**: Drag and drop task cards between columns to change their status.

## 🔄 State Management

- Frontend uses React hooks for local state management
- Optimistic updates for better UX
- Error handling with automatic retry mechanisms
- Loading states for all async operations

## 🎨 Styling

- Tailwind CSS for modern, responsive design
- Custom color schemes for different columns
- Smooth animations and transitions
- Mobile-friendly responsive layout


## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Database integration (MongoDB)
- [ ] Task categories and labels
- [ ] Due dates and reminders
- [ ] Task comments and attachments
- [ ] Advanced filtering and search


## AI help
[Link to the prompts I used for this project](https://claude.ai/share/8ed22938-d1c2-473f-acab-6612d9bee62b)

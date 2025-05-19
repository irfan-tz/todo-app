from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import Dict, Optional
import time
import random
import string

app = FastAPI(title="Task Board API", version="1.0.0")

# CORS configuration
origins = [
    "https://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TaskMove(BaseModel):
    source_column: str
    destination_column: str
    task_id: str

# Data file path - Fixed to use the correct path inside the container
DATA_FILE = "tasks.json"

# Initialize data file if it doesn't exist
def init_data_file():
    if not os.path.exists(DATA_FILE):
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        
        # Initial data structure
        initial_data = {
            "to-do": {},
            "in-progress": {},
            "done": {}
        }
        
        with open(DATA_FILE, "w") as f:
            json.dump(initial_data, f, indent=2)

# Load data from file
def load_data():
    init_data_file()
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Return default structure if file is corrupted or missing
        return {
            "to-do": {},
            "in-progress": {},
            "done": {}
        }

# Save data to file
def save_data(data):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")
        raise HTTPException(status_code=500, detail="Failed to save data")

# Generate unique task ID
def generate_task_id():
    timestamp = str(int(time.time() * 1000))
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"task-{timestamp}-{random_suffix}"

#****************************************************************************************************************************
# API Routes

@app.get("/")
async def root():
    return {"message": "Task Board API", "version": "1.0.0"}

@app.post("/tasks/move")
async def move_task(move_request: TaskMove):
    """Move a task from one column to another"""
    valid_columns = ["to-do", "in-progress", "done"]
    
    # Validate request data
    if not all([move_request.source_column, move_request.destination_column, move_request.task_id]):
        raise HTTPException(status_code=400, detail="Missing required fields: source_column, destination_column, task_id")
    
    if move_request.source_column not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Invalid source column '{move_request.source_column}'. Valid columns are: {valid_columns}")
    
    if move_request.destination_column not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Invalid destination column '{move_request.destination_column}'. Valid columns are: {valid_columns}")
    
    data = load_data()
    
    # Initialize columns if they don't exist
    for col in valid_columns:
        if col not in data:
            data[col] = {}
    
    # Check if source column exists and has the task
    if move_request.task_id not in data[move_request.source_column]:
        raise HTTPException(status_code=404, detail=f"Task '{move_request.task_id}' not found in source column '{move_request.source_column}'")
    
    # Get the task
    task = data[move_request.source_column].pop(move_request.task_id)
    
    # Update timestamp
    task["updated_at"] = time.time()
    
    # Add to destination column
    data[move_request.destination_column][move_request.task_id] = task
    
    # Save data
    save_data(data)
    
    return {
        "message": "Task moved successfully",
        "task": task,
        "from": move_request.source_column,
        "to": move_request.destination_column
    }

@app.get("/tasks/{column_id}")
async def get_tasks(column_id: str):
    """Get all tasks from a specific column"""
    valid_columns = ["to-do", "in-progress", "done"]
    
    if column_id not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Invalid column. Valid columns are: {valid_columns}")
    
    data = load_data()
    return data.get(column_id, {})

@app.get("/tasks")
async def get_all_tasks():
    """Get all tasks from all columns"""
    data = load_data()
    return data

@app.post("/tasks/{column_id}")
async def create_task(column_id: str, task: TaskCreate):
    """Create a new task in the specified column"""
    valid_columns = ["to-do", "in-progress", "done"]
    
    if column_id not in valid_columns:
        raise HTTPException(status_code=400, detail=f"Invalid column. Valid columns are: {valid_columns}")
    
    data = load_data()
    
    # Generate unique task ID
    task_id = generate_task_id()
    
    # Create task object
    new_task = {
        "id": task_id,
        "title": task.title,
        "description": task.description,
        "created_at": time.time(),
        "updated_at": time.time()
    }
    
    # Add task to the specified column
    if column_id not in data:
        data[column_id] = {}
    
    data[column_id][task_id] = new_task
    
    # Save data
    save_data(data)
    
    return new_task

@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update an existing task"""
    data = load_data()
    
    # Find the task across all columns
    task_found = False
    target_column = None
    
    for column_id, tasks in data.items():
        if task_id in tasks:
            task_found = True
            target_column = column_id
            break
    
    if not task_found:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update the task
    current_task = data[target_column][task_id]
    
    if task_update.title is not None:
        current_task["title"] = task_update.title
    
    if task_update.description is not None:
        current_task["description"] = task_update.description
    
    current_task["updated_at"] = time.time()
    
    # Save data
    save_data(data)
    
    return current_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    data = load_data()
    
    # Find and remove the task across all columns
    task_found = False
    
    for column_id, tasks in data.items():
        if task_id in tasks:
            deleted_task = tasks.pop(task_id)
            task_found = True
            save_data(data)
            return {"message": "Task deleted successfully", "deleted_task": deleted_task}
    
    if not task_found:
        raise HTTPException(status_code=404, detail="Task not found")



# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

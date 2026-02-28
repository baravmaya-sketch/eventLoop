from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid

app = FastAPI(title="Stack & Loop API")

# Configure CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:4300"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import sqlite3

# Initialize SQLite database
DB_FILE = "snippets.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS snippets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            code TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

class Snippet(BaseModel):
    id: Optional[str] = None
    title: str
    code: str

@app.get("/")
async def root():
    return {"message": "Stack & Loop API is running"}

@app.post("/snippets", response_model=Snippet)
async def create_snippet(snippet: Snippet):
    snippet_id = str(uuid.uuid4())
    snippet.id = snippet_id
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO snippets (id, title, code) VALUES (?, ?, ?)",
        (snippet_id, snippet.title, snippet.code)
    )
    conn.commit()
    conn.close()
    return snippet

@app.get("/snippets/{snippet_id}", response_model=Snippet)
async def get_snippet(snippet_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snippets WHERE id = ?", (snippet_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return Snippet(**dict(row))

@app.get("/snippets", response_model=List[Snippet])
async def list_snippets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM snippets")
    rows = cursor.fetchall()
    conn.close()
    return [Snippet(**dict(row)) for row in rows]

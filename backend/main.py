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

# In-memory storage for snippets
snippets_db = {}

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
    snippets_db[snippet_id] = snippet
    return snippet

@app.get("/snippets/{snippet_id}", response_model=Snippet)
async def get_snippet(snippet_id: str):
    if snippet_id not in snippets_db:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return snippets_db[snippet_id]

@app.get("/snippets", response_model=List[Snippet])
async def list_snippets():
    return list(snippets_db.values())

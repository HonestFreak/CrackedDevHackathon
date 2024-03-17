import google.generativeai as genai
from fastapi import FastAPI
import os
from dotenv import load_dotenv
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

history_list = {
        "session_id": ["message 1" , "answer 1", "message 2" , "answer 2"]
    }

origins = [
    "http://localhost",
    "http://localhost:3000",  # Assuming your frontend runs on port 3000
    # Add more origins as needed
]

# Add CORS middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

API = os.getenv("API")


@app.get("/initiate/")
def initiate(job_description: str, session_id: str):
    genai.configure(api_key=API)
    gemini = genai.GenerativeModel('gemini-pro')
    history_list[session_id] = []

    chat = gemini.start_chat()
    message = "The job description is: " + job_description 
    init = chat.send_message(message)
    history_list[session_id].append(message)
    history_list[session_id].append(init.text)

    history = [ {'role':'user',
                        'parts':[job_description]}, {'role':'model','parts':[init.text]} ]

    message = "Roleplay as a interview coach, to Analyze and judge my current job level preparedness for the above job by asking me techincal questions. those will be such that you can evaluate my current level based on answers to prepare a roadmap for me. DOn't give answers, wait for use to reply Example : When working with Tailwind CSS in a React project, how would you style a button component to have a primary color and rounded corners? " 
    
    chat = gemini.start_chat(history=history)
    ans =  chat.send_message(message).text
    
    history_list[session_id].append(message)
    history_list[session_id].append(ans)

    return {"answer": ans}

@app.get("/skill_analysis/")
def skill_test(session_id: str, answers: str, days_left: int):
    genai.configure(api_key=API)
    gemini = genai.GenerativeModel('gemini-pro')
    history = history_list[session_id]
    current_history = []

    for h in range(len(history)):
        if (h % 2 == 1):
            current_history.append(
                    {'role':'model',
                        'parts':[history[h]]}
                 )
        else:
            current_history.append(
                    {'role':'user',
                    'parts':[history[h]]}
                    )

    suffix = """
now judge these answers , and based on that tell my job level preparedness.
Based on that give me a roadmap to prepare if my job interview is in""" + str(days_left) + """ days
Feel free to give resources and their links , sites , articles , demos , github , youtube videos anything
Keep it step by step and give detailed plan for each day. Use emojis to make it more interactive.
"""
    message = answers + " " + suffix
    chat = gemini.start_chat(history=current_history)
    ans =  chat.send_message(message).text
    return {"answer": ans}

@app.get("/resume_analysis/")
def ats_test(session_id: str, resume: str):
    genai.configure(api_key=API)
    gemini = genai.GenerativeModel('gemini-pro')
    prefix = """
is there some tips or methods how I can modify my resume , so that my chances for this company increases. give ats score for resume with context of the job description in the end.
below is my resume : """
    history = history_list[session_id]
    message = prefix + resume
    current_history = []

    for h in range(len(history)):
        if (h % 2 == 1):
            current_history.append(
                    {'role':'model',
                        'parts':[history[h]]}
                 )
        else:
            current_history.append(
                    {'role':'user',
                    'parts':[history[h]]}
                    )
    chat = gemini.start_chat(history=current_history)
    ans =  chat.send_message(message).text
    return {"answer": ans}
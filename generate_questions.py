import json
import random

subjects = [
    "Aptitude", "Engineering Maths", "Digital Logic", 
    "Computer Organization and Architecture", "Programming and Data Structures", "Algorithms", 
    "Theory of Computation", "Compiler Design", "Operating System", 
    "Database", "Computer Networking", "Discrete Maths"
]

questions = []

for i in range(15):
    q_type = random.choices(["MCQ", "MSQ", "NAT"], weights=[0.6, 0.2, 0.2])[0]
    marks = random.choice([1, 2])
    subject = random.choice(subjects)
    difficulty = random.randint(1, 5)
    
    base_q = {
        "text": f"Sample auto-generated {q_type} question {i+1} covering {subject}. What is the correct answer?",
        "type": q_type,
        "marks": marks,
        "subject": subject,
        "difficultyLevel": difficulty
    }
    
    if q_type == "MCQ":
        base_q["options"] = [
            f"Option A for Q{i+1}",
            f"Option B for Q{i+1}",
            f"Option C for Q{i+1}",
            f"Option D for Q{i+1}"
        ]
        base_q["correctOption"] = random.choice(["a", "b", "c", "d"])
    elif q_type == "MSQ":
        base_q["options"] = [
            f"Option A for Q{i+1}",
            f"Option B for Q{i+1}",
            f"Option C for Q{i+1}",
            f"Option D for Q{i+1}"
        ]
        k = random.randint(1, 4) # MSQ can have 1 to 4 correct options
        base_q["correctOptions"] = random.sample(["a", "b", "c", "d"], k)
    elif q_type == "NAT":
        ans = random.uniform(10.0, 100.0)
        base_q["rangeStart"] = round(ans - 0.5, 2)
        base_q["rangeEnd"] = round(ans + 0.5, 2)
        
    questions.append(base_q)

with open(r'c:\Users\Pradeep Aswani\Downloads\maggic-mock-main\sample_questions.json', 'w') as f:
    json.dump(questions, f, indent=2)

print("Successfully generated 100 strictly formatted questions in sample_questions.json")

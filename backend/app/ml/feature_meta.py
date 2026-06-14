"""
Static metadata about the 32 input features used by the FAILSAFE model.

Categorical option lists come from the trained model's `le_dict` (label
encoder classes), so they always match what the model was trained on.
Numeric ranges/descriptions are based on the UCI Student Performance
dataset documentation and are used to build the single-student form and
to give the LLM plain-language feature names.
"""

FEATURE_LABELS = {
    "school": "School",
    "sex": "Sex",
    "age": "Age",
    "address": "Home address type",
    "famsize": "Family size",
    "Pstatus": "Parents' cohabitation status",
    "Medu": "Mother's education level",
    "Fedu": "Father's education level",
    "Mjob": "Mother's job",
    "Fjob": "Father's job",
    "reason": "Reason for choosing this school",
    "guardian": "Student's guardian",
    "traveltime": "Home-to-school travel time",
    "studytime": "Weekly study time",
    "failures": "Past class failures",
    "schoolsup": "Extra educational support",
    "famsup": "Family educational support",
    "paid": "Extra paid classes",
    "activities": "Extra-curricular activities",
    "nursery": "Attended nursery school",
    "higher": "Wants to take higher education",
    "internet": "Internet access at home",
    "romantic": "In a romantic relationship",
    "famrel": "Quality of family relationships",
    "freetime": "Free time after school",
    "goout": "Going out with friends",
    "Dalc": "Workday alcohol consumption",
    "Walc": "Weekend alcohol consumption",
    "health": "Current health status",
    "absences": "Number of school absences",
    "G1": "First-period grade (G1, out of 20)",
    "course": "Subject / course",
}

FEATURE_DESCRIPTIONS = {
    "school": "Which school the student attends.",
    "sex": "Student's sex.",
    "age": "Student's age in years (15-22).",
    "address": "Whether the student's home is in an urban or rural area.",
    "famsize": "Whether the family has 3 or fewer members (LE3) or more (GT3).",
    "Pstatus": "Whether the student's parents live together (T) or apart (A).",
    "Medu": "Mother's education level: 0=none, 1=primary (4th grade), 2=5th-9th grade, 3=secondary, 4=higher education.",
    "Fedu": "Father's education level: 0=none, 1=primary (4th grade), 2=5th-9th grade, 3=secondary, 4=higher education.",
    "Mjob": "Mother's occupation.",
    "Fjob": "Father's occupation.",
    "reason": "The main reason the student chose this school.",
    "guardian": "The student's primary guardian.",
    "traveltime": "Home-to-school travel time: 1=<15 min, 2=15-30 min, 3=30-60 min, 4=>60 min.",
    "studytime": "Weekly study time: 1=<2 hours, 2=2-5 hours, 3=5-10 hours, 4=>10 hours.",
    "failures": "Number of past class failures (0 to 3 or more).",
    "schoolsup": "Whether the student receives extra educational support from the school.",
    "famsup": "Whether the student receives educational support from their family.",
    "paid": "Whether the student takes extra paid classes for the subject.",
    "activities": "Whether the student takes part in extra-curricular activities.",
    "nursery": "Whether the student attended nursery school.",
    "higher": "Whether the student wants to pursue higher education.",
    "internet": "Whether the student has internet access at home.",
    "romantic": "Whether the student is in a romantic relationship.",
    "famrel": "Quality of family relationships, from 1 (very bad) to 5 (excellent).",
    "freetime": "Amount of free time after school, from 1 (very low) to 5 (very high).",
    "goout": "Frequency of going out with friends, from 1 (very low) to 5 (very high).",
    "Dalc": "Workday alcohol consumption, from 1 (very low) to 5 (very high).",
    "Walc": "Weekend alcohol consumption, from 1 (very low) to 5 (very high).",
    "health": "Current health status, from 1 (very bad) to 5 (very good).",
    "absences": "Number of school absences (0 to 93).",
    "G1": "First-period grade, out of 20.",
    "course": "Which subject this record relates to (Math or Portuguese).",
}

# Numeric features: (min, max, step)
NUMERIC_RANGES = {
    "age": (15, 22, 1),
    "Medu": (0, 4, 1),
    "Fedu": (0, 4, 1),
    "traveltime": (1, 4, 1),
    "studytime": (1, 4, 1),
    "failures": (0, 3, 1),
    "famrel": (1, 5, 1),
    "freetime": (1, 5, 1),
    "goout": (1, 5, 1),
    "Dalc": (1, 5, 1),
    "Walc": (1, 5, 1),
    "health": (1, 5, 1),
    "absences": (0, 93, 1),
    "G1": (0, 20, 1),
}

NUMERIC_COLS = list(NUMERIC_RANGES.keys())

# Logical groupings for the single-student form UI
FIELD_GROUPS = {
    "Demographics": ["school", "sex", "age", "address", "course"],
    "Family Background": [
        "famsize", "Pstatus", "Medu", "Fedu", "Mjob", "Fjob", "guardian", "famrel",
    ],
    "Study & Academic History": [
        "reason", "studytime", "traveltime", "failures", "schoolsup", "famsup",
        "paid", "higher", "internet", "G1",
    ],
    "Lifestyle & Behaviour": [
        "activities", "nursery", "romantic", "freetime", "goout", "Dalc", "Walc",
        "health", "absences",
    ],
}

# Default value used when a feature is missing from an uploaded CSV / form
# and has no other reasonable default.
CATEGORICAL_DEFAULTS = {
    "course": "mat",
}

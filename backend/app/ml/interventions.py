"""Rule-based intervention suggestions, ported from FAILSAFE_Project.ipynb."""

RULES = {
    "failures": "Schedule extra tutoring sessions to address past course failures.",
    "absences": "Contact the student/guardian about attendance - frequent absences are hurting performance.",
    "G1": "First-term grade is low - recommend a study plan review with the subject teacher.",
    "goout": "High social activity may be affecting study time - suggest a balanced weekly schedule.",
    "studytime": "Low weekly study hours - recommend a structured self-study timetable.",
    "famrel": "Family relationship quality is a factor - consider a counsellor check-in.",
    "health": "Health issues may be impacting attendance/performance - recommend a wellness check.",
    "Walc": "Weekend alcohol consumption flagged as a factor - consider a counsellor referral.",
    "Dalc": "Daily alcohol consumption flagged as a factor - recommend counselling support.",
    "traveltime": "Long commute may be reducing study time - discuss flexible homework deadlines or local study groups.",
    "freetime": "High unstructured free time - encourage joining a study group or supervised activity.",
    "schoolsup": "Student is not receiving extra educational support - consider enrolling them in a school support program.",
    "famsup": "Limited family educational support - connect the family with resources to help at home.",
    "internet": "No internet access at home may limit access to study materials - provide offline resources or library access.",
}


def suggest_interventions(top_factors, top_n=3):
    """
    Given a list of top SHAP factors (dicts/objects with 'feature' and
    'shap_impact'), suggest interventions for the risk-increasing ones.
    """
    suggestions = []

    risk_factors = [f for f in top_factors if f["shap_impact"] > 0][:top_n]

    for factor in risk_factors:
        rule = RULES.get(factor["feature"])
        if rule:
            suggestions.append(rule)

    if not suggestions:
        suggestions.append("No major red flags - continue regular monitoring.")

    return suggestions

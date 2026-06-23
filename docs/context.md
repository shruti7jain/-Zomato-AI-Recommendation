# ZOMATA Milestone AI — Project Context

## Overview

This project is an **AI-powered restaurant recommendation system** inspired by Zomato. The system intelligently suggests restaurants based on user preferences by combining structured restaurant data with a Large Language Model (LLM).

---

## Objective

Design and implement an application that:

- Takes user preferences (such as location, budget, cuisine, and ratings)
- Uses a real-world dataset of restaurants
- Leverages an LLM to generate personalized, human-like recommendations
- Displays clear and useful results to the user

---

## System Workflow

### 1. Data Ingestion

- Load and preprocess the Zomato dataset from Hugging Face:
  - **Dataset URL:** https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation
- Extract relevant fields such as:
  - Restaurant name
  - Location
  - Cuisine
  - Cost
  - Rating
  - Other applicable metadata from the dataset

### 2. User Input

Collect user preferences through the application:

| Preference | Examples |
|------------|----------|
| **Location** | Delhi, Bangalore |
| **Budget** | Low, medium, high |
| **Cuisine** | Italian, Chinese |
| **Minimum rating** | User-defined threshold |
| **Additional preferences** | Family-friendly, quick service, etc. |

### 3. Integration Layer

- Filter and prepare relevant restaurant data based on user input
- Pass structured results into an LLM prompt
- Design a prompt that helps the LLM reason and rank options

### 4. Recommendation Engine

Use the LLM to:

- **Rank** restaurants based on user preferences and filtered data
- **Explain** why each recommendation fits the user's criteria
- **Optionally summarize** the overall set of choices

### 5. Output Display

Present top recommendations in a user-friendly format. Each recommendation should include:

- Restaurant Name
- Cuisine
- Rating
- Estimated Cost
- AI-generated explanation

---

## Key Technical Requirements

| Area | Requirement |
|------|-------------|
| **Data source** | Hugging Face Zomato restaurant dataset |
| **AI component** | Large Language Model for ranking and explanation |
| **Input** | Structured user preferences (location, budget, cuisine, rating, extras) |
| **Processing** | Filter dataset → build LLM prompt → generate recommendations |
| **Output** | Ranked list with human-readable AI explanations |

---

## Architecture Summary

```
User Preferences
       ↓
  Data Filtering (structured dataset)
       ↓
  LLM Prompt (filtered results + user context)
       ↓
  Recommendation Engine (rank, explain, summarize)
       ↓
  User-Friendly Output Display
```

---

## Success Criteria

The application is complete when it:

1. Successfully loads and preprocesses the Zomato dataset
2. Accepts and validates user preference inputs
3. Filters restaurant data according to those preferences
4. Sends prepared context to an LLM with an effective prompt
5. Returns ranked recommendations with clear, personalized explanations
6. Presents results in an accessible, readable format

---

## Source

This context is derived from `docs/problemstatement.txt` — the official problem statement for the ZOMATA Milestone AI project.

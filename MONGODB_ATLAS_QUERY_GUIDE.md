# MongoDB Atlas Manual Query Guide

## How to Locate Quick Assessment Responses in MongoDB Atlas

### Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Log in to your account
3. Select your cluster
4. Click **"Browse Collections"** button

### Step 2: Navigate to Caregivers Collection
1. In the left sidebar, find your database (likely named `nlfcp` or similar)
2. Click on **`caregivers`** collection
3. Find your caregiver by searching in the filter box:

```json
{ "name": "caregiverone" }
```

Or use case-insensitive regex:

```json
{ "name": { "$regex": "caregiverone", "$options": "i" } }
```

4. **Copy the `_id` value** from the result (e.g., `6926e80c422dc90b49c4e67e`)

### Step 3: Locate Quick Assessments in Caregiverprograms
1. Switch to **`caregiverprograms`** collection
2. Use this filter to find the program document:

```json
{ "caregiverId": ObjectId("6926e80c422dc90b49c4e67e") }
```

**Important:** Replace `6926e80c422dc90b49c4e67e` with your actual caregiver ID from Step 2.

### Step 4: View Quick Assessment Responses

Once you find the caregiverprograms document, expand these fields:
- **`quickAssessments`** - Array containing all quick assessment responses
- Each assessment has:
  - `day` - Which day (0, 1, 2, etc.)
  - `type` - "quick_assessment"
  - `language` - "english", "hindi", or "kannada"
  - `completedAt` - Timestamp
  - `responses` - Array of answers:
    - `questionId` - Question identifier
    - `questionText` - The actual question
    - `responseValue` - User's answer (0-4 for assessments)
    - `answeredAt` - Timestamp

### Step 5: View One-Time Assessments (Day 1 Burden, Day 2 Stress)

In the same caregiverprograms document, look for:
- **`oneTimeAssessments`** - Array containing Zarit Burden and DASS-21 Stress responses
- Each assessment has:
  - `assessmentType` - "burden" or "stress"
  - `day` - Day number
  - `totalScore` - Calculated score
  - `burdenLevel` or `stressLevel` - "mild", "moderate", or "severe"
  - `language` - Response language
  - `completedAt` - Timestamp
  - `responses` - Array of all 22 (burden) or 7 (stress) answers

---

## Advanced Filtering Examples

### Find all caregivers who completed Day 0
```json
{ "quickAssessments": { "$elemMatch": { "day": 0 } } }
```

### Find caregivers with specific burden level
```json
{ "oneTimeAssessments": { "$elemMatch": { "assessmentType": "burden", "burdenLevel": "severe" } } }
```

### Find caregivers who completed stress assessment
```json
{ "oneTimeAssessments": { "$elemMatch": { "assessmentType": "stress", "day": 2 } } }
```

### Find by current day progress
```json
{ "currentDay": 1 }
```

### Find by burden category
```json
{ "burdenCategory": "moderate" }
```

---

## Using MongoDB Compass (Desktop Application)

If you have MongoDB Compass installed:

1. Connect using your Atlas connection string
2. Navigate to your database → `caregiverprograms` collection
3. Use the **Filter** bar with the same JSON queries above
4. Click on **Schema** tab to see data distribution
5. Use **Aggregation** tab for complex queries

### Sample Aggregation Pipeline (Find all quick assessments for a caregiver)

```json
[
  {
    "$match": {
      "caregiverId": ObjectId("6926e80c422dc90b49c4e67e")
    }
  },
  {
    "$project": {
      "caregiverId": 1,
      "quickAssessments": 1,
      "oneTimeAssessments": 1,
      "currentDay": 1
    }
  },
  {
    "$unwind": "$quickAssessments"
  },
  {
    "$sort": {
      "quickAssessments.day": 1
    }
  }
]
```

---

## Quick Reference Table

| What to Find | Collection | Filter Query |
|-------------|-----------|--------------|
| Caregiver profile | `caregivers` | `{ "name": "caregiverone" }` |
| Quick assessments | `caregiverprograms` | `{ "caregiverId": ObjectId("...") }` then check `quickAssessments` field |
| Burden assessment | `caregiverprograms` | `{ "caregiverId": ObjectId("...") }` then check `oneTimeAssessments` field |
| Stress assessment | `caregiverprograms` | `{ "caregiverId": ObjectId("...") }` then check `oneTimeAssessments` field |
| Day progress | `caregiverprograms` | `{ "caregiverId": ObjectId("...") }` then check `currentDay` field |

---

## Common ObjectIds from Your Database

Based on recent tests:

- **Caregiver "caregiverone"**: `6926e80c422dc90b49c4e67e`
- **Their program document**: `6926e870422dc90b49c4edeb`
- **Caregiver "checkyyy"**: `6911d6d744bed0e3ccfcb592` (no program data yet)

---

## Notes

- Always use `ObjectId("...")` wrapper when filtering by `_id` or reference fields
- Atlas web interface auto-converts strings to ObjectId in most cases
- Quick assessments are **embedded arrays**, not separate documents
- Each caregiver has ONE caregiverprograms document containing ALL their responses
- Use `$elemMatch` for querying nested array conditions

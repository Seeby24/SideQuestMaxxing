# Architektur

## Komponente

- NavigationTabs
- QuestCard
- QuestList
- QuestDetail
- Button
- ProfileCard
- DuelCard

## Navigation

- Stack
- Bottom Navigation

### Tree:

- Home
  - QuestList
  - QuestDetail
  - ActiveQuest
- Crew
  - Friends
  - Duelle
- Profile
  - Settings

## Datenmodelle

```JSON
User {
    id,
    username,
    email,
    points,
    level,
    completedQuests,
    friends
}

Quest {
    id,
    title,
    description,
    points,
    difficulty,
    category,
    status
}

CompletedQuest {
    id,
    questId,
    completedAt,
    proofImage
}

Duell {
    id,
    questId,
    player1Id,
    player2Id,
    status,
    winnerId,
    createdAt
}
```

## Zustand & Side-Effects

### Lokal

- selectedQuest
- photo
- isCompleted

### Global

- User
- points
- friends
- activeQuest

### API / Local Storage

- Quests über API laden
- Quest abschliessen und Punkte speichern
- Freunde und Duelle über API verwalten
- Login über API
- Auth-Token mit AsyncStorage speichern
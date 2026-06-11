# SpeakAble AI - Implementation Guide

## Overview

This document provides a comprehensive implementation guide for the SpeakAble AI system, including mini-games, interactive stories, and cross-cutting features.

## Directory Structure

```
src/
├── lib/
│   ├── minigame-sdk/
│   │   ├── types.ts                    # Core type definitions
│   │   ├── telemetry.ts                # Game telemetry hook
│   │   ├── game-registry.ts            # Game metadata registry
│   │   ├── session-writer.ts           # Session result writer
│   │   ├── game-state.ts               # Game state reducer
│   │   ├── assignment.ts               # Therapist assignment logic
│   │   └── schema.ts                   # Database schemas
│   ├── story-engine/
│   │   ├── types.ts                    # Story types
│   │   ├── runtime.ts                  # Story runtime logic
│   │   └── narrative-grammar.ts        # Chapter configuration
│   ├── telemetry/
│   │   ├── unified.ts                  # Unified telemetry hook
│   │   └── queue.ts                    # Telemetry queue
│   └── adaptive/
│       ├── engine.ts                   # Adaptive game selection
│       ├── difficulty-policy.ts        # Difficulty policy engine
│       ├── reward-engine.ts            # Reward calculation
│       ── session-controller.ts       # Session fatigue management
├── components/
│   ├── games/
│   │   ├── PhonemePairsGame.tsx
│   │   └── ToneMatchGame.tsx
│   ├── story/
│   │   ├── ScenePlayer.tsx
│   │   ├── CampaignMap.tsx
│   │   └── StoryProgress.tsx
│   ├── therapist/
│   │   └── PhonemeTagger.tsx
│   └── parent/
│       └── WeeklyProgressRing.tsx
└── app/
    ├── games/
    │   ├── page.tsx
    │   ├── phoneme-pairs/page.tsx
    │   └── tone-match/page.tsx
    ├── stories/
    │   ├── page.tsx
    │   └── aura-journey/[chapterId]/page.tsx
    ├── parent/
    │   └── insights/page.tsx
    ├── therapist/
    │   └── dashboard/page.tsx
    └── admin/
        ├── game-builder/page.tsx
        ├── story-builder/page.tsx
        └── migration-guide/page.tsx
```

## Implementation Status

### ✅ Completed

1. **Mini-Game SDK**
   - Type definitions
   - Telemetry system
   - Game registry
   - Session writer
   - Game state management
   - Assignment system
   - Database schemas

2. **Story Engine**
   - Type definitions
   - Runtime logic
   - Narrative grammar
   - Scene player component
   - Campaign map component

3. **Adaptive System**
   - Game selection engine
   - Difficulty policy
   - Reward engine
   - Session controller

4. **UI Components**
   - Phoneme Pairs Game
   - Tone Match Game
   - Scene Player
   - Campaign Map
   - Story Progress
   - Phoneme Tagger
   - Weekly Progress Ring

5. **Pages**
   - Games index
   - Stories index
   - Parent insights
   - Therapist dashboard
   - Game builder (admin)
   - Story builder (admin)
   - Migration guide

### 🔄 Next Steps

1. **API Endpoints**
   - `/api/telemetry/session` - POST session results
   - `/api/telemetry/unified` - POST unified events
   - `/api/therapist/assignments` - POST/Create assignments
   - `/api/therapist/phoneme-tags` - GET/POST/DELETE phoneme tags
   - `/api/session/complete` - POST complete session
   - `/api/parent/insights/[learnerId]` - GET parent insights
   - `/api/therapist/learner-engagement/[learnerId]` - GET engagement metrics
   - `/api/analytics/story/[storyId]` - GET story analytics
   - `/api/tts/character` - POST character voice TTS
   - `/api/coop/create` - POST create coop session
   - `/api/coop/join` - POST join coop session
   - `/api/coop/session/[roomCode]` - GET coop session

2. **Supabase Integration**
   - Run migration schemas
   - Configure RLS policies
   - Set up Edge Functions
   - Configure storage buckets

3. **Testing**
   - Unit tests for SDK modules
   - Integration tests for APIs
   - E2E tests for user flows

4. **Deployment**
   - Deploy to VPS
   - Configure environment variables
   - Set up monitoring

## Quick Start

1. **Database Setup**
   - Navigate to `/admin/migration-guide`
   - Run all SQL schemas in Supabase SQL editor
   - Configure RLS policies

2. **Seed Data**
   - Run seed script for `game_metadata` table
   - Create initial stories in `/admin/story-builder`

3. **Development**
   ```bash
   npm run dev
   ```

4. **Testing**
   - Visit `/games` to play mini-games
   - Visit `/stories` to explore interactive stories
   - Visit `/parent/insights` to view parent dashboard
   - Visit `/therapist/dashboard` to view therapist dashboard
   - Visit `/admin/game-builder` to create assignments
   - Visit `/admin/story-builder` to author stories

## Architecture Decisions

1. **Telemetry Queue**: Events are queued and flushed every 5 seconds to reduce API calls
2. **Adaptive Difficulty**: Policy engine evaluates learner performance and adjusts difficulty
3. **Story Branching**: Scenes branch based on confidence scores and attempt counts
4. **Fatigue Detection**: Sliding window analysis of error rates and latency
5. **Unified Telemetry**: Single queue for both game and story events

## API Documentation

See individual route files in `src/app/api/` for detailed API documentation.

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update this guide when adding major features
4. Use conventional commits

## License

Proprietary - SpeakAble HK

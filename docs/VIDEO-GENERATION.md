# Video Generation Documentation

## Overview

The AI Video Generation feature enables users to transform scripts into complete videos with AI-generated visuals, voice-over audio, and browser-based video assembly.

## Architecture

### System Flow

```
Script → Video Project → Scenes → Generation → Assembly → Final Video
```

1. **Script Input**: User provides script content
2. **Scene Parsing**: Script is segmented into scenes
3. **Visual Generation**: AI generates images for each scene
4. **Audio Generation**: AI synthesizes voice-over audio
5. **Video Assembly**: FFmpeg WASM combines scenes into video
6. **Download**: User downloads final MP4 file

## Database Schema

### video_projects

Stores video project metadata and status.

```sql
CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  script_id UUID REFERENCES scripts(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  settings JSONB,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Status Values**:
- `pending`: Project created, scenes not generated
- `generating`: Scenes being generated
- `completed`: All scenes generated successfully
- `failed`: Generation failed

### video_scenes

Stores individual scene data for each video project.

```sql
CREATE TABLE video_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  script_segment TEXT NOT NULL,
  visual_prompt TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  duration_seconds NUMERIC DEFAULT 5.0,
  status TEXT DEFAULT 'pending',
  transition_type TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Status Values**:
- `pending`: Scene awaiting generation
- `generating_image`: Image generation in progress
- `generating_audio`: Audio generation in progress
- `completed`: Both image and audio generated
- `failed`: Generation failed

### video_assets

Stores references to generated media assets.

```sql
CREATE TABLE video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES video_scenes(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Asset Types**:
- `image`: Scene visual
- `audio`: Voice-over audio
- `video`: Rendered scene video
- `thumbnail`: Project thumbnail

## Edge Functions

### generate-video-project

Creates a new video project and parses script into scenes.

**Endpoint**: `/functions/v1/generate-video-project`

**Request Body**:
```typescript
{
  scriptId: string;
  title: string;
  description?: string;
  settings?: {
    maxScenes?: number;
    sceneDuration?: number;
  };
}
```

**Response**:
```typescript
{
  project: VideoProject;
  sceneCount: number;
}
```

**Process**:
1. Fetch script content
2. Create video_projects record
3. Split script into segments (max 20)
4. Generate visual prompts for each segment
5. Calculate duration estimates
6. Insert video_scenes records

### generate-scene-visuals

Generates AI image for a specific scene.

**Endpoint**: `/functions/v1/generate-scene-visuals`

**Request Body**:
```typescript
{
  sceneId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  sceneId: string;
  imageUrl: string; // Base64 data URL
}
```

**Process**:
1. Fetch scene details
2. Verify user ownership
3. Update status to 'generating_image'
4. Call Lovable AI Gateway (Gemini 3 Pro Image)
5. Fallback to fast model on rate limit
6. Update scene with image_url
7. Create video_assets record

### generate-scene-audio

Generates AI voice-over audio for a scene.

**Endpoint**: `/functions/v1/generate-scene-audio`

**Request Body**:
```typescript
{
  sceneId: string;
  voice?: string; // Default: 'alloy'
}
```

**Response**:
```typescript
{
  success: boolean;
  sceneId: string;
  audioUrl: string; // Base64 data URL
}
```

**Process**:
1. Fetch scene details
2. Verify user ownership
3. Update status to 'generating_audio'
4. Call OpenAI TTS API
5. Convert audio to base64
6. Update scene with audio_url
7. Create video_assets record

### get-video-projects

Fetches user's video projects.

**Endpoint**: `/functions/v1/get-video-projects`

**Request Body**:
```typescript
{
  projectId?: string; // Optional: fetch specific project
}
```

**Response**:
```typescript
{
  projects?: VideoProject[]; // If no projectId
  project?: VideoProject & { scenes: VideoScene[] }; // If projectId provided
}
```

## Client-Side Hooks

### useVideoGeneration

Main hook for video generation operations.

**Location**: `src/hooks/useVideoGeneration.tsx`

**Methods**:
- `createVideoProject(scriptId, title, description?, settings?)`: Create new project
- `generateSceneVisuals(sceneId)`: Generate image for scene
- `generateSceneAudio(sceneId)`: Generate audio for scene
- `generateAllScenes(projectId)`: Generate all scenes sequentially
- `fetchProjects()`: Fetch user's projects
- `fetchProject(projectId)`: Fetch specific project with scenes

**State**:
- `loading`: Generation in progress
- `progress`: Overall generation progress (0-100)

**Example**:
```typescript
const {
  createVideoProject,
  generateAllScenes,
  loading,
  progress,
} = useVideoGeneration();

// Create project
const project = await createVideoProject(
  scriptId,
  'My Video',
  'A short video',
  { maxScenes: 10 }
);

// Generate all scenes
await generateAllScenes(project.id);
```

### useVideoAssembler

Hook for assembling final video using FFmpeg WASM.

**Location**: `src/hooks/useVideoAssembler.tsx`

**Methods**:
- `assembleVideo(scenes, projectTitle)`: Assemble scenes into video
- `downloadAssembledVideo(filename)`: Download rendered video
- `resetAssembler()`: Clean up resources

**State**:
- `isAssembling`: Assembly in progress
- `assemblyProgress`: { stage: string, progress: number }
- `assembledVideoUrl`: Object URL of assembled video

**Example**:
```typescript
const {
  assembleVideo,
  downloadAssembledVideo,
  isAssembling,
  assemblyProgress,
  assembledVideoUrl,
} = useVideoAssembler();

// Assemble video
await assembleVideo(scenes, 'My Video');

// Download video
if (assembledVideoUrl) {
  downloadAssembledVideo('my-video.mp4');
}
```

## Video Assembly Process

### FFmpeg WASM

The video assembly process runs entirely in the browser using FFmpeg compiled to WebAssembly.

**Library**: `@ffmpeg/ffmpeg`

**Steps**:

#### 1. Load FFmpeg
```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
await ffmpeg.load({
  coreURL: await toBlobURL('...ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('...ffmpeg-core.wasm', 'application/wasm'),
});
```

#### 2. Create Scene Videos
For each scene:
```typescript
// Write image to virtual filesystem
await ffmpeg.writeFile('scene.png', await fetchFile(imageUrl));

// Write audio to virtual filesystem
await ffmpeg.writeFile('audio.mp3', await fetchFile(audioUrl));

// Create video with image + audio
await ffmpeg.exec([
  '-loop', '1',              // Loop the image
  '-i', 'scene.png',         // Input image
  '-i', 'audio.mp3',         // Input audio
  '-c:v', 'libx264',         // H.264 video codec
  '-tune', 'stillimage',     // Optimize for still images
  '-c:a', 'aac',             // AAC audio codec
  '-b:a', '192k',            // Audio bitrate
  '-pix_fmt', 'yuv420p',     // Pixel format for compatibility
  '-shortest',               // End when audio ends
  'output.mp4'
]);

// Read output
const data = await ffmpeg.readFile('output.mp4');
```

#### 3. Concatenate Scenes
```typescript
// Create concat list file
const concatList = scenes.map((_, i) => `file 'scene${i}.mp4'`).join('\n');
await ffmpeg.writeFile('concat.txt', concatList);

// Concatenate all scenes
await ffmpeg.exec([
  '-f', 'concat',      // Use concat demuxer
  '-safe', '0',        // Allow absolute paths
  '-i', 'concat.txt',  // Input concat list
  '-c', 'copy',        // Copy streams (no re-encoding)
  'final.mp4'
]);

// Read final video
const finalVideo = await ffmpeg.readFile('final.mp4');
```

#### 4. Create Downloadable Blob
```typescript
const blob = new Blob([finalVideo], { type: 'video/mp4' });
const url = URL.createObjectURL(blob);
```

## UI Components

### VideoProjectCard

Displays video project card with thumbnail and status.

**Location**: `src/components/VideoProjectCard.tsx`

**Props**:
```typescript
interface VideoProjectCardProps {
  project: VideoProject;
  onEdit: (projectId: string) => void;
}
```

### VideoPreviewPlayer

Video player with controls and download button.

**Location**: `src/components/VideoPreviewPlayer.tsx`

**Props**:
```typescript
interface VideoPreviewPlayerProps {
  videoUrl: string;
  title: string;
  onDownload: () => void;
}
```

## Pages

### VideoGenerator (`/video-generator`)

Main video generation page.

**Features**:
- List existing video projects
- Create new video project from script
- Configure voice and aspect ratio

### VideoEditor (`/video-editor/:projectId`)

Video project editor page.

**Features**:
- View project details
- Generate all scenes
- Track generation progress
- Render final video
- Preview and download video

## Best Practices

### Scene Generation

#### Optimal Scene Count
- **Short videos (< 30s)**: 3-5 scenes
- **Medium videos (30-60s)**: 5-10 scenes
- **Long videos (> 60s)**: 10-20 scenes

#### Scene Duration
- Minimum: 2 seconds
- Maximum: 15 seconds
- Optimal: 5-8 seconds

### Visual Prompts

#### Good Visual Prompts
```
✅ "A modern office space with natural lighting, plants, and large windows"
✅ "Close-up of hands typing on a laptop keyboard with coffee cup nearby"
✅ "Wide shot of a sunset over mountains with orange and pink sky"
```

#### Poor Visual Prompts
```
❌ "an office"
❌ "typing"
❌ "sunset"
```

### Performance Optimization

#### Parallel Generation
Generate multiple scenes in parallel (limit: 3-5 concurrent):
```typescript
const batches = chunk(scenes, 3);
for (const batch of batches) {
  await Promise.all(
    batch.map(scene => generateSceneVisuals(scene.id))
  );
}
```

#### Memory Management
Clean up FFmpeg resources after assembly:
```typescript
resetAssembler(); // Revokes object URLs and cleans up FFmpeg
```

## Troubleshooting

### Common Issues

#### "Rate limit exceeded"
**Cause**: Too many AI requests
**Solution**: 
- Implement delays between requests
- Use fallback to fast model
- Reduce concurrent generation count

#### "FFmpeg loading failed"
**Cause**: Network issues or CDN unavailable
**Solution**:
- Check network connection
- Retry loading
- Use alternative CDN

#### "Scene generation stuck"
**Cause**: AI API timeout or network issue
**Solution**:
- Implement timeout handling
- Add retry logic
- Show error state to user

#### "Video rendering fails"
**Cause**: Missing audio/image, corrupted data
**Solution**:
- Validate all scenes have image_url and audio_url
- Check data URLs are valid
- Log FFmpeg output for debugging

### Debug Logging

Enable detailed logging:
```typescript
// In edge functions
console.log('Scene generation:', {
  sceneId,
  visualPrompt: scene.visual_prompt,
  model: AI_MODELS.imageGeneration.default,
});

// In video assembly
ffmpeg.on('log', ({ message }) => {
  console.log('[FFmpeg]', message);
});
```

## Future Enhancements

### Planned Features
- Background music support
- Scene transitions
- Text overlays
- Advanced editing capabilities
- Template library
- Batch video generation
- Cloud rendering option

### Performance Improvements
- Worker threads for FFmpeg
- Progressive video loading
- Scene caching
- Optimized encoding settings

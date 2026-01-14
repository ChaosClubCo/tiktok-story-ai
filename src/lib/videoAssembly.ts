/**
 * Video Assembly Utilities using FFmpeg WASM
 * Browser-based video rendering with no server dependencies
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * Load FFmpeg WASM core
 * Uses CDN to avoid CORS issues
 */
export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (ffmpegInstance?.loaded) return ffmpegInstance;
  }

  isLoading = true;

  try {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      onProgress?.(progress * 100);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } finally {
    isLoading = false;
  }
}

/**
 * Create a video scene from an image and audio file
 */
export async function createSceneVideo(
  ffmpeg: FFmpeg,
  imageUrl: string,
  audioUrl: string,
  sceneIndex: number,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const imageName = `scene${sceneIndex}.png`;
    const audioName = `audio${sceneIndex}.mp3`;
    const outputName = `output${sceneIndex}.mp4`;

    // Write input files to FFmpeg virtual filesystem
    await ffmpeg.writeFile(imageName, await fetchFile(imageUrl));
    await ffmpeg.writeFile(audioName, await fetchFile(audioUrl));

    // Create video with image + audio
    // -loop 1: loop the image
    // -i: input file
    // -c:v libx264: use H.264 codec for video
    // -tune stillimage: optimize for still images
    // -c:a aac: use AAC codec for audio
    // -b:a 192k: audio bitrate 192 kbps
    // -pix_fmt yuv420p: pixel format for compatibility
    // -shortest: finish encoding when shortest input ends
    await ffmpeg.exec([
      '-loop', '1',
      '-i', imageName,
      '-i', audioName,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      outputName,
    ]);

    // Read output file
    const data = await ffmpeg.readFile(outputName);

    // Clean up
    await ffmpeg.deleteFile(imageName);
    await ffmpeg.deleteFile(audioName);
    await ffmpeg.deleteFile(outputName);

    return data as Uint8Array;
  } catch (error) {
    console.error(`Error creating scene ${sceneIndex}:`, error);
    throw error;
  }
}

/**
 * Concatenate multiple video scenes into a final video
 */
export async function concatenateScenes(
  ffmpeg: FFmpeg,
  sceneVideos: Uint8Array[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    // Write all scene videos to virtual filesystem
    for (let i = 0; i < sceneVideos.length; i++) {
      await ffmpeg.writeFile(`scene${i}.mp4`, sceneVideos[i]);
    }

    // Create concat demuxer input file
    const concatList = sceneVideos
      .map((_, i) => `file 'scene${i}.mp4'`)
      .join('\n');
    
    await ffmpeg.writeFile('concat.txt', concatList);

    // Concatenate all scenes
    // -f concat: use concat demuxer
    // -safe 0: allow absolute paths
    // -i: input concat list
    // -c copy: copy streams without re-encoding (faster)
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'final.mp4',
    ]);

    // Read final video
    const data = await ffmpeg.readFile('final.mp4');

    // Clean up
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('final.mp4');
    for (let i = 0; i < sceneVideos.length; i++) {
      await ffmpeg.deleteFile(`scene${i}.mp4`);
    }

    return data as Uint8Array;
  } catch (error) {
    console.error('Error concatenating scenes:', error);
    throw error;
  }
}

/**
 * Add background music to video
 */
export async function addBackgroundMusic(
  ffmpeg: FFmpeg,
  videoData: Uint8Array,
  musicUrl: string,
  musicVolume: number = 0.3,
  videoDuration: number,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    // Write video to virtual filesystem
    await ffmpeg.writeFile('input.mp4', videoData);
    
    // Fetch and write music
    const musicData = await fetchFile(musicUrl);
    await ffmpeg.writeFile('music.mp3', musicData);

    // Mix video audio with background music
    // -stream_loop: loop music to match video duration
    // -filter_complex: mix audio streams with volume adjustment
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-stream_loop', '-1',
      '-i', 'music.mp3',
      '-filter_complex',
      `[0:a]volume=1.0[a1];[1:a]volume=${musicVolume}[a2];[a1][a2]amix=inputs=2:duration=first[aout]`,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      'output.mp4',
    ]);

    // Read output
    const data = await ffmpeg.readFile('output.mp4');

    // Clean up
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('music.mp3');
    await ffmpeg.deleteFile('output.mp4');

    return data as Uint8Array;
  } catch (error) {
    console.error('Error adding background music:', error);
    throw error;
  }
}

/**
 * Main function to generate video from scenes with optional background music
 */
export async function generateVideoFromScenes(
  scenes: Array<{ imageUrl: string; audioUrl: string }>,
  onProgress?: (stage: string, progress: number) => void,
  backgroundMusicUrl?: string,
  musicVolume?: number
): Promise<Blob> {
  try {
    // Load FFmpeg
    onProgress?.('Loading FFmpeg WASM', 0);
    const ffmpeg = await loadFFmpeg((p) => onProgress?.('Loading FFmpeg WASM', p));

    // Generate individual scene videos
    const sceneVideos: Uint8Array[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      onProgress?.(`Rendering scene ${i + 1}/${scenes.length}`, (i / scenes.length) * 100);
      
      const sceneVideo = await createSceneVideo(
        ffmpeg,
        scene.imageUrl,
        scene.audioUrl,
        i
      );
      
      sceneVideos.push(sceneVideo);
    }

    // Concatenate all scenes
    onProgress?.('Merging scenes', 80);
    let finalVideo = await concatenateScenes(ffmpeg, sceneVideos);

    // Add background music if provided
    if (backgroundMusicUrl && musicVolume !== undefined) {
      onProgress?.('Adding background music', 90);
      const totalDuration = scenes.length * 5; // Approximate total duration
      finalVideo = await addBackgroundMusic(
        ffmpeg,
        finalVideo,
        backgroundMusicUrl,
        musicVolume,
        totalDuration,
        (p) => onProgress?.('Adding background music', 90 + p * 0.1)
      );
    }

    // Convert to blob
    onProgress?.('Finalizing video', 100);
    const buffer = new Uint8Array(finalVideo);
    return new Blob([buffer], { type: 'video/mp4' });
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

/**
 * Download video file
 */
export function downloadVideo(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Cleanup FFmpeg instance
 */
export function cleanupFFmpeg(): void {
  ffmpegInstance = null;
}

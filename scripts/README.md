# SoulSync Audio Generation Scripts

This directory contains scripts for generating high-quality, natural-sounding voice audio for meditation guidance using opensource TTS technology.

## Overview

We provide **two solutions** for generating natural voices:

1. **Edge TTS** (`generate_audio.py`) - Online, requires internet
2. **Piper TTS** (`generate_audio_offline.py`) - Offline, no internet needed

Both produce professional-quality, natural-sounding audio perfect for meditation guidance.

## Features

- ✨ **Natural Neural Voices**: High-quality, human-like speech
- 🎯 **Meditation-Optimized**: Slow speech rate and soothing pitch
- 🆓 **Completely Free**: No API keys or costs required
- 🔧 **Easy to Use**: Simple Python scripts
- 🌍 **Multiple Options**: Online and offline solutions

## Quick Start

### Option 1: Edge TTS (Online - Recommended)

**Requires internet connection**

1. Install dependencies:
```bash
cd scripts
pip install -r requirements.txt
```

2. Generate audio:
```bash
python generate_audio.py
```

3. Audio files will be saved to `assets/audio/`

### Option 2: Piper TTS (Offline)

**Works without internet after initial setup**

1. Install Piper TTS:
```bash
pip install piper-tts
```

2. Generate audio:
```bash
python generate_audio_offline.py
```

The script will automatically download the voice model on first run.

## Running Locally (If Docker/Container has no Internet)

If you're running in a containerized environment without internet access:

1. **Copy the scripts to your local machine:**
```bash
# From the project root
cp -r scripts ~/soulsync-audio-generation
cd ~/soulsync-audio-generation
```

2. **Install dependencies locally:**
```bash
pip install -r requirements.txt
```

3. **Run the generation script:**
```bash
python generate_audio.py
```

4. **Copy generated files back:**
```bash
cp *.mp3 /path/to/SoulSync/assets/audio/
```

## Generated Audio Files

The script generates the following files:

- `soul_remembrance.mp3` - QHHT Induction & Soul Remembrance (5 min)
- `quantum_field.mp3` - Quantum Field & Divine Source Connection (5 min)
- `past_life.mp3` - QHHT Past Life Regression (5 min)
- `higher_self.mp3` - QHHT Higher Self Communication (5 min)
- `body_scan.mp3` - QHHT Body Scanning & Theta Healing (5 min)

## Voice Customization

### Available Voices

To see all available voices:

```bash
python generate_audio.py --list-voices
```

### Recommended Meditation Voices

**Female Voices (Calm & Soothing):**
- `en-US-AriaNeural` - Warm, calming (default for some scripts)
- `en-US-JennyNeural` - Gentle, mystical (default for some scripts)
- `en-US-SaraNeural` - Soft, compassionate
- `en-GB-SoniaNeural` - British, elegant
- `en-AU-NatashaNeural` - Australian, friendly

**Male Voices (Deep & Grounding):**
- `en-US-GuyNeural` - Professional, steady
- `en-GB-RyanNeural` - British, authoritative
- `en-AU-WilliamNeural` - Australian, warm

### Customizing Speech Parameters

Edit `generate_audio.py` and modify the following parameters for each script:

```python
{
    "voice": "en-US-AriaNeural",  # Voice to use
    "rate": "-35%",               # Speech rate (-100% to +100%)
    "pitch": "-5Hz",              # Pitch adjustment (-50Hz to +50Hz)
    "script": "..."               # The meditation script text
}
```

**Speech Rate Guide:**
- `-40%` to `-30%`: Very slow (deep meditation, regression)
- `-30%` to `-20%`: Slow (guided meditation)
- `-20%` to `-10%`: Moderately slow (relaxation)

**Pitch Guide:**
- `-10Hz` to `-5Hz`: Lower, more soothing
- `-5Hz` to `0Hz`: Slightly lower
- `0Hz` to `+5Hz`: Natural to slightly higher

## Advanced Usage

### Generate Single File

To generate only one meditation:

```python
import asyncio
from generate_audio import generate_audio, MEDITATION_SCRIPTS

# Generate just the first script
asyncio.run(generate_audio(MEDITATION_SCRIPTS[0]))
```

### Add New Meditation Script

1. Add your script to the `MEDITATION_SCRIPTS` list in `generate_audio.py`
2. Specify the output filename, voice, and speech parameters
3. Run the generation script

Example:

```python
{
    "id": "script_new_meditation",
    "filename": "new_meditation.mp3",
    "voice": "en-US-AriaNeural",
    "rate": "-35%",
    "pitch": "-5Hz",
    "script": "Your meditation script text here..."
}
```

## Troubleshooting

### Installation Issues

If you have issues installing `edge-tts`:

```bash
pip install --upgrade pip
pip install edge-tts
```

### Network Issues

Edge TTS requires an internet connection to generate audio. Ensure you have a stable connection when running the script.

### Audio Quality

If you want to adjust audio quality or format:

1. Edge TTS generates MP3 files at 24kHz sample rate by default
2. For higher quality, you can post-process with ffmpeg:

```bash
ffmpeg -i input.mp3 -ar 48000 -ab 256k output.mp3
```

## Alternative TTS Options

If you prefer other TTS solutions:

### 1. Piper TTS (Offline)

- Fully offline
- Very fast
- Good quality
- Install: `pip install piper-tts`

### 2. Coqui TTS

- High-quality voices
- Many voice options
- More resource intensive
- Install: `pip install TTS`

### 3. gTTS (Google TTS)

- Simple but lower quality
- Good for testing
- Install: `pip install gtts`

## Contributing

To add new voices or improve audio quality:

1. Test different voices using `--list-voices`
2. Experiment with rate and pitch settings
3. Consider adding background music mixing
4. Add support for multiple languages

## License

This script is part of SoulSync and uses opensource TTS technology.
Edge TTS is free for personal and commercial use.
